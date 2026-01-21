import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "~~/components/ui/card";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TotalPolls = () => {
  const { data: pollCount } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getPollCount",
  });

  return (
    <Card className="glass-card border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Polls</p>
            <p className="text-3xl font-bold text-success">{Number(pollCount) || 0}</p>
          </div>
          <ClipboardList className="w-8 h-8 text-success" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalPolls;
