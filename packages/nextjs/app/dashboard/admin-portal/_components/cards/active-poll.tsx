import React from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "~~/components/ui/card";
import { useChallengeStore } from "~~/services/store/zk-store";

const ActivePoll = () => {
  const activePollId = useChallengeStore(state => state.currentPollid);

  return (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Poll</p>
            <p className="text-3xl font-bold text-success">{activePollId ? "1" : "0"}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-success" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivePoll;
