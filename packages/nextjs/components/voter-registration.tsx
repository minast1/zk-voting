import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
//import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Fr } from "@aztec/bb.js";
import { CheckCircle, Shield } from "lucide-react";
import { poseidon2 } from "poseidon-lite";
import { toHex } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
//import useVoterData from "~~/hooks/useVoterData";
import { CommitmentData, useChallengeStore } from "~~/services/store/zk-store";

interface VoterRegistrationProps {
  leafEvents: any[];
}

const generateCommitment = async (): Promise<CommitmentData> => {
  const nullif = BigInt(Fr.random().toString());
  const sec = BigInt(Fr.random().toString());
  const comm = poseidon2([nullif, sec]);
  const commitment = toHex(comm, { size: 32 });
  const nullifier = toHex(nullif, { size: 32 });
  const secret = toHex(sec, { size: 32 });

  return { commitment, nullifier, secret };
};
export function VoterRegistration({ leafEvents }: VoterRegistrationProps) {
  //const { canRegister } = useVoterData();
  const [isGenerating, setIsGenerating] = useState(false);
  // const [isInserting, setIsInserting] = useState(false);
  // const [error, setError] = useState("");
  const setCommitmentData = useChallengeStore(state => state.setCommitmentData);
  const commitmentData = useChallengeStore(state => state.commitmentData);
  const updateCommitmentIndex = useChallengeStore(state => state.updateCommitmentIndex);
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "Voting",
  });
  const handleGenerateCommitment = async (): Promise<CommitmentData> => {
    setIsGenerating(true);
    try {
      const commitment = await generateCommitment();
      setCommitmentData(commitment);
      return commitment;
      setIsGenerating(false);
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
    try {
      await writeContractAsync(
        {
          functionName: "register",
          args: [BigInt(commitmentData.commitment)],
        },
        {
          blockConfirmations: 1,
          onBlockConfirmation: () => {
            if (leafEvents) {
              const leafIndex = leafEvents.length;
              updateCommitmentIndex(leafIndex);
            }
          },
        },
      );
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <Card className="glass-card border-primary/20 animate-scale-in max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl gradient-text">Register to Vote</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter a unique identifier to prove your eligibility. Your identity will be hashed to ensure privacy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Unique Identifier</label>
          <div className="relative">
            <Input
              type={showId ? "text" : "password"}
              placeholder="e.g., email, national ID, passport number..."
              value={uniqueId}
              onChange={e => handleIdChange(e.target.value)}
              className="pr-10 bg-secondary/50 border-border focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowId(!showId)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div> */}

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

        <Button onClick={handleRegister} className="w-full" size="lg" disabled={isGenerating || isPending}>
          {isGenerating || isPending ? (
            <>
              <Spinner />
              Registering...
            </>
          ) : (
            "Register & Start Voting"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
