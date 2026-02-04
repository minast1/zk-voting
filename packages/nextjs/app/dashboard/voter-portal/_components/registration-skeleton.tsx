import React from "react";
import { Card, CardContent, CardHeader } from "~~/components/ui/card";
import { Skeleton } from "~~/components/ui/skeleton";

const RegistrationSkeleton = () => {
  return (
    <Card className="border-none">
      <CardHeader className="text-center pb-2">
        <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
        <Skeleton className="h-7 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-11 w-full" />
      </CardContent>
    </Card>
  );
};

export default RegistrationSkeleton;
