import React from "react";
import { Card, CardContent, CardHeader } from "~~/components/ui/card";
import { Skeleton } from "~~/components/ui/skeleton";

const PollsSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-32" />
      </div> */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 rounded-lg bg-secondary/30 text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-4 h-2 w-full rounded-full" />
          <Skeleton className="mt-2 h-3 w-32 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
};

export default PollsSkeleton;
