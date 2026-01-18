import React from "react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent } from "~~/components/ui/card";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const PollRow = ({ id }: { id: number }) => {
  const { data: pollData } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getPoll",
    args: [BigInt(id)],
  });

  return (
    <>
      {pollData && (
        <Card className="glass-card border-border/50 opacity-70" key={id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{pollData[0]}</p>
                <p className="text-xs text-muted-foreground">{pollData[1] + pollData[2]} total votes</p>
              </div>
              <Badge variant="secondary">Closed</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PollRow;
