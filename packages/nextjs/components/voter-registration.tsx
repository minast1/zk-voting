"use client";

import { useState } from "react";
//import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
//import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { CheckCircle } from "lucide-react";
//import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
//import useVoterData from "~~/hooks/useVoterData";
import { CommitmentData, useChallengeStore } from "~~/services/store/zk-store";

interface VoterRegistrationProps {
  leafEvents: any[];
}

const generateCommitment = async (): Promise<CommitmentData> => {
  const res = await fetch("/api/commitment", { method: "POST" });
  const { commitment, nullifier, secret } = await res.json();
  return { commitment, nullifier, secret };
};

export const VoterRegistration = ({ leafEvents }: VoterRegistrationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegistering] = useState(false);
  // const router = useRouter();
  const setCommitmentData = useChallengeStore(state => state.setCommitmentData);
  const commitmentData = useChallengeStore(state => state.commitmentData);
  //const updateCommitmentIndex = useChallengeStore(state => state.updateCommitmentIndex);
  // const { writeContractAsync } = useScaffoldWriteContract({
  //   contractName: "Voting",
  // });
  console.log(leafEvents);
  const handleGenerateCommitment = async (): Promise<CommitmentData> => {
    setIsGenerating(true);
    try {
      const commitment = await generateCommitment();
      setCommitmentData(commitment);

      setIsGenerating(false);
      return commitment;
    } catch (error) {
      console.log("Error generating commitment:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegister = async () => {
    const commitmentData = await handleGenerateCommitment();

    if (!commitmentData) {
      console.error("Please generate a commitment first");
      return;
    }
    // try {
    //   setIsRegistering(true);
    //   await writeContractAsync(
    //     {
    //       functionName: "register",

    //       args: [BigInt(commitmentData.commitment)],
    //     },
    //     {
    //       blockConfirmations: 1,
    //       onBlockConfirmation: () => {
    //         if (leafEvents) {
    //           const leafIndex = leafEvents.length;
    //           updateCommitmentIndex(leafIndex);
    //           setIsRegistering(false);
    //           router.push(`/dashboard`);
    //         }
    //       },
    //     },
    //   );
    // } catch (error) {
    //   console.error("Error registering:", error);
    //   setIsRegistering(false);
    // }
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
          ) : isRegistering ? (
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
