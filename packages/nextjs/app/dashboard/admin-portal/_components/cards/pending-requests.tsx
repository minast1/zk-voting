import React from "react";
import StatsSkeleton from "../stats-skeleton";
import { Clock } from "lucide-react";
import { Card, CardContent } from "~~/components/ui/card";
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
import { useChallengeStore } from "~~/services/store/zk-store";

const PendingRequests = () => {
  const poll_id = useChallengeStore(state => state.currentPollid);
  const { voterManagementList: pendingRequests, isLoading } = useVoterManagementLIst(
    poll_id ? BigInt(poll_id) : undefined,
  );

  return isLoading ? (
    <StatsSkeleton />
  ) : (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-3xl font-bold text-success">{pendingRequests.length}</p>
          </div>
          <Clock className="w-8 h-8 text-success" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingRequests;
