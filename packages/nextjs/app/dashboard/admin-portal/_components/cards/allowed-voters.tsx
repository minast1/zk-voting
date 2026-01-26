import React from "react";
import { useScaffoldEventHistory } from "../../../../../hooks/scaffold-eth/useScaffoldEventHistory";
import StatsSkeleton from "../stats-skeleton";
import { Users } from "lucide-react";
import { Card, CardContent } from "~~/components/ui/card";
import { useChallengeStore } from "~~/services/store/zk-store";

const AllowedVoters = () => {
  const activePollId = useChallengeStore(state => state.currentPollid);
  const { data: voterAddedEvents, isLoading } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "VoterAdded",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || 0n),
    watch: true,
  });

  const totalAllowdVoters =
    activePollId == null
      ? 0
      : voterAddedEvents.reduce((count, event) => {
          return Number(event.args.poll_id) === activePollId ? count + 1 : count;
        }, 0);
  return isLoading ? (
    <StatsSkeleton />
  ) : (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Allowed Voters</p>
            <p className="text-3xl font-bold text-success">{totalAllowdVoters}</p>
          </div>
          <Users className="w-8 h-8 text-success" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AllowedVoters;
