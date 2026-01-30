import React from "react";
import { Card, CardContent } from "~~/components/ui/card";
import { Skeleton } from "~~/components/ui/skeleton";

const PastPollsSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-24" />
      {[1, 2].map(i => (
        <Card key={i} className="glass-card border-border/50 opacity-70">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PastPollsSkeleton;
