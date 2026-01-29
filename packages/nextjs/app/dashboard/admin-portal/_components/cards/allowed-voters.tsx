import React from "react";
import StatsSkeleton from "../stats-skeleton";
import { Users } from "lucide-react";
import { Card, CardContent } from "~~/components/ui/card";
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
import { useChallengeStore } from "~~/services/store/zk-store";

const AllowedVoters = () => {
  const activePollId = useChallengeStore(state => state.currentPollid);
  const { voterManagementList, isLoading } = useVoterManagementLIst(activePollId ? BigInt(activePollId) : undefined);
  const totalAllowedVoters = voterManagementList.filter(v => v.status === "approved").length;
  return isLoading ? (
    <StatsSkeleton />
  ) : (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Allowed Voters</p>
            <p className="text-3xl font-bold text-success">{totalAllowedVoters}</p>
          </div>
          <Users className="w-8 h-8 text-success" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AllowedVoters;
