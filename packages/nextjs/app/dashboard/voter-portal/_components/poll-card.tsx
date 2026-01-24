"use client";

import { useState } from "react";
import { Check, CheckCircle2, Clock, Fingerprint, Loader2, ShieldCheck, Users, X } from "lucide-react";
import { useConnectorClient, usePublicClient } from "wagmi";
//import { getContract, parseEther } from "viem";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~~/components/ui/card";
import { Progress } from "~~/components/ui/progress";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useBlockAwareExpiration } from "~~/hooks/useBlockAwareExpiration";
import { invokeLocalBurner } from "~~/lib/local-burner";
import { timeAgo } from "~~/lib/time-converter";
//import uint8ArrayToHexString from "~~/lib/uint-to-hex";
import { cn } from "~~/lib/utils";
import { useChallengeStore } from "~~/services/store/zk-store";
import { notification } from "~~/utils/scaffold-eth";

interface PollCardProps {
  poll: any;
  animationDelay?: number;
  leafEvents: any[];
  _pollId: number;
}

function stringifyBigInt(obj: any) {
  return JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value));
}

export const PollCard = ({ poll, animationDelay = 0, leafEvents, _pollId }: PollCardProps) => {
  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | null>(null);
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const { data: mainWalletClient } = useConnectorClient({
    chainId: targetNetwork.id,
  });
  const CommitmentData = useChallengeStore(state => state.commitmentData);
  const setProofGenerated = useChallengeStore(state => state.setProofGenerated);
  const setProofData = useChallengeStore(state => state.setProofData);
  const proofData = useChallengeStore(state => state.proofData);
  const hasVoted = useChallengeStore(state => state.hasVoted);
  const setHasVoted = useChallengeStore(state => state.setHasVoted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingProof, setIsGenerating] = useState(false);

  const { data: contractInfo } = useDeployedContractInfo({ contractName: "Voting" });
  //console.log(uint8ArrayToHexString(proofData?.proof));
  const totalVotes = Number(poll[1] + poll[2]);
  const yesPercentage = totalVotes > 0 ? (Number(poll[1]) / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (Number(poll[2]) / totalVotes) * 100 : 0;
  const { status } = useBlockAwareExpiration();

  const generateMerkleProof = async () => {
    if (!CommitmentData) return;
    setIsGenerating(true);
    try {
      const proofData = await fetch("/api/proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: stringifyBigInt({
          nullifier: CommitmentData.nullifier,
          poll_id: _pollId,
          secret: CommitmentData.secret,
          root: poll[7], // ✅
          depth: poll[6],
          index: CommitmentData.index,
          leafEvents,
          selectedVote,
        }),
      });
      const res = await proofData.json();
      setProofGenerated(true);
      setProofData({ proof: res.proof, publicInputs: res.publicInputs });
      setIsGenerating(false);
      return res;
    } catch (error) {
      notification.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGenerating(false);
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
          notification.success("Vote submitted successfully");
          setHasVoted(true);
          setIsSubmitting(false);
        }
      } else {
        // invokeProductionBurner
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
            {totalVotes} votes
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
            {/* <div className="flex items-center gap-2 text-sm font-medium">
              <Fingerprint className="w-4 h-4 text-primary" />
              <span>Merkle Proof Required</span>
            </div> */}
            <p className="text-xs text-muted-foreground text-center">Choose Your Vote</p>

            {!hasVoted && status === "active" && typeof CommitmentData?.index !== undefined ? (
              <>
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
                {selectedVote && (
                  <>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Fingerprint className="w-4 h-4 text-primary" />
                        <span>Merkle Proof Required</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Generate a Merkle proof to verify your eligibility without revealing your identity.
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
                        disabled={isGeneratingProof}
                      >
                        {isGeneratingProof ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Proof...
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-4 h-4" />
                            Generate Merkle Proof
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
                      {poll[1]} ({yesPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={yesPercentage} className="h-2 bg-secondary" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-destructive" />
                      No
                    </span>
                    <span className="font-mono">
                      {poll[2]} ({noPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={noPercentage} className="h-2 bg-secondary" />
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
