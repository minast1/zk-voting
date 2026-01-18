import React from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "~~/components/ui/card";

const PendingRequests = () => {
  return (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-3xl font-bold text-success">{0}</p>
          </div>
          <Clock className="w-8 h-8 text-success" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingRequests;
