import React from "react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent } from "~~/components/ui/card";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { timeAgo } from "~~/lib/time-converter";

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
          <CardContent className="md:py-1">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <p className="font-normal text-sm md:text-base md:font-medium">{pollData[0]}</p>
                <p className="text-xs text-muted-foreground">{pollData[1] + pollData[2]} total votes</p>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-xs text-muted-foreground"> {timeAgo(pollData[4])}</span>
                <Badge variant="success">Closed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PollRow;
