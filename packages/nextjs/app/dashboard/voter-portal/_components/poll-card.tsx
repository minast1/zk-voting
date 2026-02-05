"use client";

import { useMemo, useState } from "react";
import { Check, CheckCircle2, Clock, Fingerprint, Loader2, ShieldCheck, Users, X } from "lucide-react";
import { useConnectorClient, usePublicClient } from "wagmi";
//import { getContract, parseEther } from "viem";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~~/components/ui/card";
import { Progress } from "~~/components/ui/progress";
import { TxnNotification, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useBlockAwareExpiration } from "~~/hooks/useBlockAwareExpiration";
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
import { invokeLocalBurner } from "~~/lib/local-burner";
import { invokeSepoliaBurner } from "~~/lib/sepolia-burner";
import { timeAgo } from "~~/lib/time-converter";
//import uint8ArrayToHexString from "~~/lib/uint-to-hex";
import { cn } from "~~/lib/utils";
import { generateProofLocally } from "~~/lib/zk-proof";
import { useChallengeStore } from "~~/services/store/zk-store";
import { getBlockExplorerTxLink, notification } from "~~/utils/scaffold-eth";

interface PollCardProps {
  poll: any;
  animationDelay?: number;
  leafEvents: any[];
  _pollId: number;
}

// function stringifyBigInt(obj: any) {
//   return JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value));
// }

export const PollCard = ({ poll, animationDelay = 0, leafEvents, _pollId }: PollCardProps) => {
  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | null>(null);
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const { data: mainWalletClient } = useConnectorClient({
    chainId: targetNetwork.id,
  });
  //console.log(leafEvents);

  const CommitmentData = useChallengeStore(state => state.commitmentData);

  const setProofGenerated = useChallengeStore(state => state.setProofGenerated);
  const setProofData = useChallengeStore(state => state.setProofData);
  const proofData = useChallengeStore(state => state.proofData);
  const hasVoted = useChallengeStore(state => state.hasVoted);
  const setHasVoted = useChallengeStore(state => state.setHasVoted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingProof, setIsGenerating] = useState(false);
  const { refetch } = useVoterManagementLIst(BigInt(_pollId));

  const { data: contractInfo } = useDeployedContractInfo({ contractName: "Voting" });
  //console.log(uint8ArrayToHexString(proofData?.proof));
  const voteStats = useMemo(() => {
    if (!poll) {
      return {
        yes: 0,
        no: 0,
        total: 0,
        yesPercentage: 0,
        noPercentage: 0,
      };
    }

    const yes = Number(poll[1]);
    const no = Number(poll[2]);
    const total = yes + no;
    const yesPercentage = total > 0 ? (yes / total) * 100 : 0;
    const noPercentage = 100 - yesPercentage;

    return {
      yes,
      no,
      total,
      yesPercentage,
      noPercentage,
    };
  }, [poll]);

  const { status } = useBlockAwareExpiration();

  const hasRegistered = useMemo(() => {
    if (!CommitmentData) return false;
    return "index" in CommitmentData;
  }, [CommitmentData]);

  //CommitmentData !== null && typeof CommitmentData.index !== undefined;
  const generateMerkleProof = async () => {
    if (!CommitmentData) {
      notification.error("No commitment data found");
      return;
    }
    //refetch leaf events
    const circuitData = await fetch("/circuits.json").then(res => res.json());
    const { isSuccess, data } = await refetch();
    if (isSuccess && data) {
      const events = data.voterRegisteredLogs;
      const currentIndex = CommitmentData.index;
      if (currentIndex === undefined || currentIndex === null) {
        console.log("Debug - CommitmentData found but index missing:", CommitmentData);
        notification.error("Registration data is still synchronizing. Please wait a moment.");
        return;
      }
      setIsGenerating(true);
      try {
        const payload = {
          nullifier: CommitmentData.nullifier,
          poll_id: _pollId,
          secret: CommitmentData.secret,
          root: poll[7], // ✅
          depth: poll[6],
          index: CommitmentData.index,
          leafEvents: events,
          selectedVote,
        };
        const proofData = await generateProofLocally(payload, circuitData);

        if (proofData) {
          setProofGenerated(true);
          setProofData({ proof: proofData.proof, publicInputs: proofData.publicInputs });
          setIsGenerating(false);
          return proofData;
        } else {
          throw new Error("Proof generation failed..Please try again");
        }
      } catch (error) {
        notification.error(error instanceof Error ? error.message : String(error));
        setIsGenerating(false);
      }
    }
  };

  const handleSubmitVote = async () => {
    setIsSubmitting(true);
    try {
      if (!CommitmentData?.secret || !proofData?.proof || !contractInfo?.address || !mainWalletClient) {
        console.log("No commitment data");
        return;
      }

      if (mainWalletClient.chain.id === 31337) {
        const txReceipt = await invokeLocalBurner({
          proofData,
          pollId: _pollId,
          contractInfo,
          publicClient,
          mainWalletClient,
        });

        if (txReceipt.status === "success") {
          //add txn link to verify
          const blockExplorerTxURL = getBlockExplorerTxLink(mainWalletClient.chain.id, txReceipt.transactionHash) || "";
          notification.success(
            <TxnNotification message="Transaction completed successfully!" blockExplorerLink={blockExplorerTxURL} />,
            {
              icon: "🎉",
              duration: 10000,
            },
          );
          setHasVoted(true);
          setIsSubmitting(false);
        }
      } else {
        //txReciept?.transactionHash
        const txReciept = await invokeSepoliaBurner({
          proofData,
          pollId: _pollId,
          contractInfo,
        });

        if (txReciept?.status === "success") {
          const blockExplorerTxURL = getBlockExplorerTxLink(mainWalletClient.chain.id, txReciept.transactionHash) || "";
          //console.log({ blockExplorerTxURL, txReciept });
          notification.success(
            <TxnNotification message="Transaction completed successfully!" blockExplorerLink={blockExplorerTxURL} />,
            {
              icon: "🎉",
              duration: 10000,
            },
          );
          setHasVoted(true);
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      notification.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
    //write contract function
  };

  return (
    <Card
      className={cn(
        "glass-card border-border/50 overflow-hidden transition-all duration-500 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2",
        hasVoted && "border-success/30",
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
        //opacity: 0,
        // animation: "slide-up 0.6s ease-out forwards",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold leading-tight">{poll[0]}</h3>
          {hasVoted && (
            <div className="flex items-center gap-1 text-success text-sm font-medium flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              Voted
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeAgo(Number(poll[3]))}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {voteStats.total} votes
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Anonymous
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <>
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
            {!hasVoted && status === "active" && hasRegistered ? (
              <>
                <p className="text-xs text-muted-foreground text-center">Choose Your Vote</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedVote === "yes" ? "voteActive" : "vote"}
                    onClick={() => setSelectedVote("yes")}
                    className="flex-col gap-1 h-auto py-4"
                  >
                    <Check
                      className={cn(
                        "w-6 h-6 transition-colors",
                        selectedVote === "yes" ? "text-primary" : "text-success",
                      )}
                    />
                    <span>Yes</span>
                  </Button>
                  <Button
                    variant={selectedVote === "no" ? "voteActive" : "vote"}
                    onClick={() => setSelectedVote("no")}
                    className="flex-col gap-1 h-auto py-4"
                  >
                    <X
                      className={cn(
                        "w-6 h-6 transition-colors",
                        selectedVote === "no" ? "text-primary" : "text-destructive",
                      )}
                    />
                    <span>No</span>
                  </Button>
                </div>
                {/* ZK Proof Section */}
                {selectedVote && hasRegistered && (
                  <>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Fingerprint className="w-4 h-4 text-primary" />
                        <span>Merkle Proof Required</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Generate a Zero Knowledge proof to verify your eligibility without revealing your identity.
                      </p>
                      {proofData?.proof && (
                        <div className="p-2 rounded bg-background/50 font-mono text-xs text-muted-foreground break-all">
                          <span className="text-primary">Proof:</span> {proofData.publicInputs[0].slice(0, 32)}...
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={generateMerkleProof}
                        disabled={isGeneratingProof || !!proofData}
                      >
                        {isGeneratingProof ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Proof...
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-4 h-4" />
                            Generate ZK Proof
                          </>
                        )}
                      </Button>
                    </div>
                    {/* Proof Verified Badge */}
                    {proofData && (
                      <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <div>
                          <p className="text-sm font-medium text-success">Proof Generated</p>
                          <p className="text-xs text-muted-foreground">You can now submit your vote</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      Yes
                    </span>
                    <span className="font-mono">
                      {voteStats.yes} ({voteStats.yesPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={voteStats.yesPercentage} className="h-2 bg-secondary" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-destructive" />
                      No
                    </span>
                    <span className="font-mono">
                      {voteStats.no} ({voteStats.noPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={voteStats.noPercentage} className="h-2 bg-secondary" />
                </div>
              </div>
            )}
          </div>
        </>
      </CardContent>

      {status === "active" && !hasVoted && selectedVote && leafEvents.length > 0 && proofData?.proof && (
        <CardFooter className="pt-0">
          <Button className="w-full" onClick={handleSubmitVote} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              `Confirm ${selectedVote.charAt(0).toUpperCase() + selectedVote.slice(1)} Vote`
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
