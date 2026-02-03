import { useState } from "react";
import { queryClient } from "../ScaffoldEthAppWithProviders";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Spinner } from "../ui/spinner";
import { Clock, HelpCircle, Plus } from "lucide-react";
import { decodeEventLog, parseAbi } from "viem";
import { usePublicClient } from "wagmi";
import { Button } from "~~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";
import { Input } from "~~/components/ui/input";
import { useDeployedContractInfo, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useChallengeStore } from "~~/services/store/zk-store";
import { notification } from "~~/utils/scaffold-eth";

// interface CreatePollDialogProps {
//   voterHash: string;
//   onPollCreated: (poll: Poll) => void;
// }

const DURATION_OPTIONS = [
  { value: "300", label: "5 minutes" },
  { value: "3600", label: "1 hour" },
  { value: "21600", label: "6 hours" },
  { value: "43200", label: "12 hours" },
  { value: "86400", label: "1 day" },
  { value: "259200", label: "3 days" },
  { value: "604800", label: "1 week" },
  // { value: "none", label: "No expiry" },
];

export function CreatePollDialog() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [duration, setDuration] = useState("24");
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const setCurrentPollId = useChallengeStore(state => state.setCurrentPollId);
  const setExpiresAt = useChallengeStore(state => state.setExpiresAt);
  const setCurrentPollQuestion = useChallengeStore(state => state.setCurrentPollQuestion);
  const { data: votingContractInfo } = useDeployedContractInfo({ contractName: "Voting" });
  const { targetNetwork } = useTargetNetwork();

  const publicClient = usePublicClient({ chainId: targetNetwork.id });

  const { writeContractAsync, isPending, isMining } = useScaffoldWriteContract({
    contractName: "Voting",
  });
  const handleCreate = async () => {
    if (!publicClient || !votingContractInfo) {
      return;
    }

    if (question.trim().length < 10) {
      setError("Question must be at least 10 characters");
      return;
    }
    if (!question.includes("?")) {
      setError("Question must end with a question mark");
      return;
    }
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + Number(duration); // Math.floor(Date.now() / 1000) + Number(duration);

    setLoading(true);
    try {
      await writeContractAsync(
        { functionName: "createPoll", args: [question.trim(), BigInt(startTime), BigInt(endTime)] },
        {
          onBlockConfirmation: async txReceipt => {
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txReceipt.transactionHash });
            const logs = receipt.logs[0];
            const decodedLog = decodeEventLog({
              abi: parseAbi([
                "event PollCreated(uint256 indexed pollId,string question,uint256 startTime, uint256 endTime)",
              ]),
              data: logs.data,
              topics: logs.topics,
            });
            setCurrentPollId(Number(decodedLog.args.pollId));
            setCurrentPollQuestion(decodedLog.args.question);
            setExpiresAt(decodedLog.args.endTime);
            await queryClient.invalidateQueries({
              queryKey: ["voterManagement", votingContractInfo.address, decodedLog.args.pollId.toString()],
            });
            setLoading(false);

            setQuestion("");
            setDuration("300");

            setError("");
            setOpen(false);
          },
        },
      );
    } catch (error) {
      notification.error(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Create a New Poll
          </DialogTitle>
          <DialogDescription>Ask a Yes/No question that registered voters can answer anonymously.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4 pt-4" onSubmit={e => e.preventDefault()}>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Your Question</Label>
            <Input
              placeholder="Should we implement feature X?"
              value={question}
              onChange={e => {
                setQuestion(e.target.value);
                setError("");
              }}
              className="bg-secondary/50 border-border focus:border-primary"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Poll Duration
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-secondary/50 border-border focus:border-primary w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 hover:cursor-pointer" onClick={handleCreate} disabled={question.length < 10}>
              {isPending || isLoading || isMining ? (
                <>
                  <Spinner className="mr-2" /> Creating...
                </>
              ) : (
                "Create Poll"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
