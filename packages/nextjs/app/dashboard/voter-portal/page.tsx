"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PollCard } from "./_components/poll-card";
import { AlertCircle, ArrowLeft, Clock, Loader2, Shield, Vote } from "lucide-react";
import { NextPage } from "next";
import { VoterRegistration } from "~~/app/dashboard/voter-portal/_components/voter-registration";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
//import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useBlockAwareExpiration } from "~~/hooks/useBlockAwareExpiration";
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
import { useChallengeStore } from "~~/services/store/zk-store";
import { notification } from "~~/utils/scaffold-eth";

const VotingPage: NextPage = () => {
  const { status, currentPollid } = useBlockAwareExpiration();
  const commitmentData = useChallengeStore(state => state.commitmentData);
  const { writeContractAsync: requestAccess } = useScaffoldWriteContract({
    contractName: "Voting",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getVoterStatus, voterRegisteredLogs } = useVoterManagementLIst(currentPollid);
  const voterStatus = getVoterStatus();
  const isOnAllowlist = voterStatus === "approved";
  const isRequestPending = voterStatus === "pending";

  const { data: activePoll } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getPoll",
    args: [currentPollid],
  });

  // console.log({ voterRegisteredLogs });
  const hasRegistered = commitmentData !== null && typeof commitmentData.index !== undefined;
  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    try {
      await requestAccess(
        {
          args: [currentPollid],
          functionName: "requestAccess",
        },
        {
          blockConfirmations: 1,
          onBlockConfirmation: () => {
            setIsSubmitting(false);
          },
        },
      );
    } catch (error) {
      notification.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-background">
      <div className="border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Voter Portal</h1>
              <p className="text-xs text-muted-foreground">Register & vote privately</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Identity Section */}

        {/* Active Poll Section */}
        <div className="space-y-4">
          {isOnAllowlist && status === "active" && commitmentData === null && (
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Your Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isOnAllowlist && (
                  <div>
                    <VoterRegistration _pollId={currentPollid ? Number(currentPollid) : 0} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Active Poll</h2>
              <p className="text-sm text-muted-foreground">
                {isOnAllowlist && hasRegistered
                  ? "Cast Your annonymous vote; Your identity is completely hidden"
                  : isOnAllowlist
                    ? "Register and cast your anonymous vote"
                    : "Get on the allowlist to participate"}
              </p>
            </div>
          </div>

          {status === "active" && isOnAllowlist && hasRegistered ? (
            <PollCard
              poll={activePoll || []}
              leafEvents={voterRegisteredLogs || []}
              _pollId={currentPollid ? Number(currentPollid) : 0}
              //onVoted={() => setActivePoll(getActivePoll())}
              animationDelay={0}
            />
          ) : status === "active" && !isOnAllowlist && !isRequestPending ? (
            <Card className="glass-card border-border/50 w-full">
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-warning" />
                <p className="font-medium text-warning mb-2">Not Eligible</p>
                <p className="text-sm text-muted-foreground mb-4">
                  You need to be on the allowlist to participate. Request access above.
                </p>
                <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : status === "active" && isRequestPending ? (
            <Card className="glass-card border-warning/30">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-warning">Request Pending</p>
                    <p className="text-sm text-muted-foreground">Your access request is awaiting admin approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : status !== "active" ? (
            <Card className="glass-card border-border/50 border-dashed bg-inherit">
              <CardContent className="py-12 text-center">
                <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No Active Poll</p>
                <p className="text-sm text-muted-foreground">Check back later for new voting opportunities</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default VotingPage;
