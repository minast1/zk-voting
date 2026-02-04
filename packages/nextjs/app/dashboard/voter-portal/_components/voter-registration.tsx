"use client";

import { useState } from "react";
//import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
//import { Input } from "./ui/input";
import { Spinner } from "../../../../components/ui/spinner";
import { CheckCircle } from "lucide-react";
import { decodeEventLog, parseAbi } from "viem";
import { queryClient } from "~~/components/ScaffoldEthAppWithProviders";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
//import useVoterData from "~~/hooks/useVoterData";
import { CommitmentData, useChallengeStore } from "~~/services/store/zk-store";
import { notification } from "~~/utils/scaffold-eth";

interface VoterRegistrationProps {
  _pollId: number | undefined;
}

const generateCommitment = async (): Promise<CommitmentData> => {
  const res = await fetch("/api/commitment", { method: "POST" });
  if (res.ok) {
    const { commitment, nullifier, secret } = await res.json();
    return { commitment, nullifier, secret };
  }
  throw new Error("Failed to generate commitment");
};

export const VoterRegistration = ({ _pollId }: VoterRegistrationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const setCommitmentData = useChallengeStore(state => state.setCommitmentData);
  const commitmentData = useChallengeStore(state => state.commitmentData);
  const { data: votingContract } = useDeployedContractInfo({ contractName: "Voting" });
  const updateCommitmentIndex = useChallengeStore(state => state.updateCommitmentIndex);
  const { writeContractAsync, isPending, isMining } = useScaffoldWriteContract({
    contractName: "Voting",
  });

  const handleGenerateCommitment = async (): Promise<CommitmentData> => {
    setIsGenerating(true);
    try {
      const commitment = await generateCommitment();
      setCommitmentData(commitment);

      setIsGenerating(false);

      return commitment;
    } catch (error) {
      console.log("Error generating commitment:", error);
      setIsGenerating(false);
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!_pollId || !votingContract) {
      notification.error("No Active Poll..Please Generate Poll First");
      return;
    }

    const commitmentData = await handleGenerateCommitment();
    const { commitment } = commitmentData;
    setIsRegistering(true);
    try {
      await writeContractAsync(
        {
          functionName: "register",

          args: [BigInt(commitment), BigInt(_pollId)],
        },
        {
          onBlockConfirmation: async txReceipt => {
            //  const receipt = await publicClient.waitForTransactionReceipt({ hash: txReceipt.transactionHash });
            const registeredLog = txReceipt.logs
              .map(log => {
                try {
                  return decodeEventLog({
                    abi: parseAbi([
                      "event CommitmentRegistered(uint256 indexed pollId,uint256 indexed index,uint256 value)",
                    ]),
                    data: log.data,
                    topics: log.topics,
                  });
                } catch {
                  return null;
                }
              })
              .find(decoded => decoded?.eventName === "CommitmentRegistered");

            if (!registeredLog) throw new Error("Registration event not found in logs");

            const newIndex = Number(registeredLog.args.index);
            updateCommitmentIndex(newIndex);

            await queryClient.invalidateQueries({
              queryKey: ["voterManagement", votingContract.address, _pollId.toString()],
            });
            notification.success("Voter Registeration Successful.!");

            setIsRegistering(false);
          },
        },
      );
      // if (hash) {

      // }
    } catch (error) {
      notification.error(error instanceof Error ? error.message : String(error));
      setIsRegistering(false);
    }
  };

  return (
    <Card className="border-none">
      {/* <CardHeader className="text-center pb-2">
        <CardDescription className="text-muted-foreground">
          Enter a unique identifier to prove your eligibility. Your identity will be hashed to ensure privacy.
        </CardDescription>
      </CardHeader> */}
      <CardContent className="space-y-4">
        {commitmentData && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Your anonymous voter ID:</p>
            <p className="font-mono text-sm text-primary break-all">{commitmentData.commitment}</p>
          </div>
        )}

        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex gap-2">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="text-success font-medium mb-1">Privacy Guaranteed</p>
              <p>Your identifier is never stored. Only a cryptographic hash is used to verify your eligibility.</p>
            </div>
          </div>
        </div>

        <Button onClick={handleRegister} className="w-full" size="lg" disabled={isGenerating || isRegistering}>
          {isGenerating ? (
            <>
              <Spinner />
              <span className="ml-2">Generating Commitment...</span>
            </>
          ) : isPending || isRegistering || isMining ? (
            <>
              <Spinner />
              <span className="ml-2">Registering Voter...</span>
            </>
          ) : (
            "Register & Start Voting"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
