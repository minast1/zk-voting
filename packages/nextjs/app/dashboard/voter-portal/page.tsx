"use client";

import React from "react";
import Link from "next/link";
import { useScaffoldEventHistory } from "../../../hooks/scaffold-eth/useScaffoldEventHistory";
import AllowlistStatusCard from "./_components/allowlist-status";
import { AlertCircle, ArrowLeft, Shield, Vote } from "lucide-react";
//import { usePathname, useRouter } from "next/navigation";
import { NextPage } from "next";
import { useAccount } from "wagmi";
//import { EmptyState } from "~~/app/dashboard/_components/empty-state";
//import { PollCard } from "~~/app/dashboard/_components/poll-card";
//import useVoterData from "~~/hooks/useVoterData";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { VoterRegistration } from "~~/components/voter-registration";
import { useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";
//import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useBlockAwareExpiration } from "~~/hooks/useBlockAwareExpiration";

const VotingPage: NextPage = () => {
  const { status, currentPollid } = useBlockAwareExpiration();
  const { address } = useAccount();
  console.log(status);

  const [liveVoters, setLiveVoters] = React.useState<Set<string>>(new Set());
  const { data: voterEvents } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "VoterAdded",
    //watch: true,
    filters: { poll_id: currentPollid !== undefined ? BigInt(currentPollid) : undefined },
    enabled: !!currentPollid,
  });

  const voters = React.useMemo(() => {
    if (!voterEvents || currentPollid === undefined) return [];

    const set = new Set<string>();

    voterEvents.forEach(e => {
      const { poll_id, voter } = e.args;
      if (poll_id === BigInt(currentPollid) && voter) {
        set.add(voter);
      }
    });

    return Array.from(set);
  }, [voterEvents, currentPollid]);

  useScaffoldWatchContractEvent({
    contractName: "Voting",
    eventName: "VoterAdded",
    onLogs: logs => {
      setLiveVoters(prev => {
        const next = new Set(prev);
        logs.forEach(log => {
          const { poll_id, voter } = log.args;
          if (poll_id === BigInt(currentPollid ?? 0) && voter) {
            next.add(voter);
          }
        });
        return next;
      });
    },
  });

  const isOnAllowlist = React.useMemo(() => {
    const allvoters = Array.from(new Set([...voters, ...liveVoters]));
    return allvoters.includes(address ?? "");
  }, [voters, liveVoters, address]);
  // const { data: leafEvents } = useScaffoldEventHistory({
  //   contractName: "Voting",
  //   eventName: "NewLeaf",
  //   watch: true,
  //   enabled: true,
  // });

  return (
    <div className="min-h-screen bg-background">
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
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Your Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isOnAllowlist && <AllowlistStatusCard status={status} pollId={currentPollid} />}
            {isOnAllowlist && (
              <div>
                <VoterRegistration leafEvents={voterEvents} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Poll Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Active Poll</h2>
              <p className="text-sm text-muted-foreground">
                {isOnAllowlist ? "Register and cast your anonymous vote" : "Get on the allowlist to participate"}
              </p>
            </div>
          </div>

          {/* {!activePoll ? ( */}
          <Card className="glass-card border-border/50 border-dashed">
            <CardContent className="py-12 text-center">
              <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No Active Poll</p>
              <p className="text-sm text-muted-foreground">Check back later for new voting opportunities</p>
            </CardContent>
          </Card>
          {/* ) : !hasEnteredId ? ( */}
          <Card className="glass-card border-border/50">
            <CardContent className="py-8 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Enter your ID above to view and participate in the poll</p>
            </CardContent>
          </Card>
          {/* ) : !isAllowed ? ( */}
          <Card className="glass-card border-border/50">
            <CardContent className="py-8 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-warning" />
              <p className="font-medium text-warning mb-2">Not Eligible</p>
              <p className="text-sm text-muted-foreground mb-4">
                You need to be on the allowlist to participate. Request access above.
              </p>
              <Button
              // onClick={handleCheckStatus}
              //  disabled={voterId.length < 6}
              >
                Submit Request
              </Button>
            </CardContent>
          </Card>
          {/* ) : ( */}
          <></>
          {/* <PollCard
            //   poll={activePoll}
            //   //onVoted={() => setActivePoll(getActivePoll())}
            //   animationDelay={0}
            // />
          )} */}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>Your vote is private and verified through zero-knowledge proofs</p>
      </footer>
    </div>
  );
};

export default VotingPage;
