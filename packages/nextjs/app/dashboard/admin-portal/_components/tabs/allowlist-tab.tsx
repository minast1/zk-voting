import React from "react";
import { useScaffoldEventHistory } from "../../../../../hooks/scaffold-eth/useScaffoldEventHistory";
import { Trash2, Users } from "lucide-react";
import { Address } from "~~/components/Address/address";
import { AddVoterDialog } from "~~/components/dialogs/add-voter";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent } from "~~/components/ui/card";
import { TabsContent } from "~~/components/ui/tabs";
import { useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";
import { useChallengeStore } from "~~/services/store/zk-store";

const AllowListTab = () => {
  const pollId = useChallengeStore(state => state.currentPollid);

  const { data: voterEvents } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "VoterAdded",
    //watch: true,
    filters: { poll_id: pollId !== undefined ? BigInt(pollId) : undefined },
    enabled: !!pollId,
  });

  const voters = React.useMemo(() => {
    if (!voterEvents || pollId === undefined) return [];

    const set = new Set<string>();

    voterEvents.forEach(e => {
      const { poll_id, voter } = e.args;
      if (poll_id === BigInt(pollId) && voter) {
        set.add(voter);
      }
    });

    return Array.from(set);
  }, [voterEvents, pollId]);

  const [liveVoters, setLiveVoters] = React.useState<Set<string>>(new Set());

  useScaffoldWatchContractEvent({
    contractName: "Voting",
    eventName: "VoterAdded",
    onLogs: logs => {
      setLiveVoters(prev => {
        const next = new Set(prev);
        logs.forEach(log => {
          const { poll_id, voter } = log.args;
          if (poll_id === BigInt(pollId ?? 0) && voter) {
            next.add(voter);
          }
        });
        return next;
      });
    },
  });

  const allVoters = React.useMemo(() => {
    return Array.from(new Set([...voters, ...liveVoters]));
  }, [voters, liveVoters]);

  return (
    <TabsContent value="voters" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Voter Allowlist</h2>
        <AddVoterDialog />
      </div>

      <Card className="glass-card border-border/50">
        {allVoters.length === 0 ? (
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No Voters Added</p>
            <p className="text-sm text-muted-foreground mb-4">Add EOA addresses to allow voting</p>
            <AddVoterDialog />
          </CardContent>
        ) : (
          <CardContent className="py-4">
            <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {allVoters.map((address, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 group">
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">{/* {voter.allowed ? "Allowed" : "Revoked"} */} Allowed</Badge>
                    <Address address={address} format="long" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    //onClick={() => handleRemoveVoter(voter.eoa)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </TabsContent>
  );
};

export default AllowListTab;
