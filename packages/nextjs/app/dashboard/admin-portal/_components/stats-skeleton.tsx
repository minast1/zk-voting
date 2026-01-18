import React from "react";
import { Card, CardContent } from "~~/components/ui/card";
import { Skeleton } from "~~/components/ui/skeleton";

const StatsSkeleton = () => {
  <div className="grid sm:grid-cols-4 gap-4 mb-8">
    {[1, 2, 3, 4].map(i => (
      <Card key={i} className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>;
};

export default StatsSkeleton;
