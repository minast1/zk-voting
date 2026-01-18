import { useScaffoldEventHistory } from "../../../../../hooks/scaffold-eth/useScaffoldEventHistory";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "~~/components/ui/card";
import { useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

const TotalPolls = () => {
  const { data: pollCreatedEvents, refetch } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "PollCreated",
    watch: true,
    fromBlock: BigInt(0),
  });

  useScaffoldWatchContractEvent({
    contractName: "Voting",
    eventName: "PollCreated",
    onLogs: () => {
      refetch();
      // setTotal(total + 1);
    },
  });
  return (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Polls</p>
            <p className="text-3xl font-bold text-success">{pollCreatedEvents?.length || 0}</p>
          </div>
          <ClipboardList className="w-8 h-8 text-success" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalPolls;
