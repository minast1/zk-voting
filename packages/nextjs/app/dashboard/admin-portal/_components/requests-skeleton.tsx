import React from "react";
import { Card, CardContent } from "~~/components/ui/card";
import { Skeleton } from "~~/components/ui/skeleton";

const RequestsSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-36" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass-card border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RequestsSkeleton;
