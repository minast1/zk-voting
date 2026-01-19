import React, { useEffect } from "react";
import PollsSkeleton from "../polls-skeleton";
import PreviousPolls from "../previous-polls";
import { Vote } from "lucide-react";
import { CreatePollDialog } from "~~/components/dialogs/create-poll";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { TabsContent } from "~~/components/ui/tabs";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useCountdown } from "~~/hooks/useCountdown";
import { cn } from "~~/lib/utils";
import { useChallengeStore } from "~~/services/store/zk-store";

const PollmonitorTab = () => {
  const currentPollId = useChallengeStore(state => state.currentPollid);
  const setCurrentPollId = useChallengeStore(state => state.setCurrentPollId);
  const setExpiresAt = useChallengeStore(state => state.setExpiresAt);
  const expiresAt = useChallengeStore(state => state.expiresAt);
  const question = useChallengeStore(state => state.currentPollQuestion);
  //const setCurrentQuestion = useChallengeStore(state => state.setCurrentPollQuestion);
  const hasHydrated = useChallengeStore(state => state.hasHydrated);

  const { data: poll, isLoading } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getPoll",
    args: [BigInt(currentPollId || 0)],
    query: {
      enabled: currentPollId !== undefined,
    },
  });

  const { isExpired, formatted } = useCountdown(expiresAt || 0n, currentPollId || 0);
  const isCountingDown = expiresAt !== undefined && currentPollId !== undefined;

  // const yesPercentage = //totalVotes > 0 ? (poll.yesVotes / totalVotes) * 100 : 0;
  useEffect(() => {
    if (isExpired && currentPollId !== undefined) {
      setCurrentPollId(undefined);
      // setCurrentQuestion(undefined);
      setExpiresAt(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired, hasHydrated]);
  //console.log(formatted);
  const handleClose = () => {
    // closePoll(poll.id);
    // onClose();
    // toast.success('Poll closed successfully');
  };

  return (
    <TabsContent value="polls" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Poll Management</h2>
        {/* {!isExpired && <CreatePollDialog />} */}
      </div>

      {isCountingDown ? (
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3  w-full ">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg">{question}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant={!isExpired ? "default" : "secondary"}>{!isExpired ? "Active" : "Closed"}</Badge>
                {!isExpired && (
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-mono", isExpired ? "text-destructive" : "text-primary")}>
                      Time Remaining {formatted}
                    </span>
                  </div>
                )}
              </CardDescription>

              {isExpired && (
                <Button variant="destructive" size="sm" onClick={handleClose}>
                  Close Poll
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-2xl font-bold text-success">{poll && Number(poll[1])}</p>
                <p className="text-xs text-muted-foreground">Yes Votes</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-2xl font-bold text-destructive">{poll && Number(poll[2])}</p>
                <p className="text-xs text-muted-foreground">No Votes</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-2xl font-bold text-primary">{poll && Number(poll[1] + poll[2])}</p>
                <p className="text-xs text-muted-foreground">Total Votes</p>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
              {/* <div 
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${yesPercentage}%` }}
          /> */}
            </div>
            {/* <p className="text-xs text-muted-foreground text-center mt-2">
          {yesPercentage.toFixed(1)}% Yes / {(100 - yesPercentage).toFixed(1)}% No
        </p> */}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PollsSkeleton />
      ) : (
        // <EmptyState />
        <Card className="glass-card border-border/50 border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
              <Vote className="w-10 h-10 text-primary" />
            </div>
            {/* <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /> */}
            <p className="text-lg font-medium mb-2">No Active Poll</p>
            <p className="text-sm text-muted-foreground mb-4">Create a new poll to get started</p>
            <CreatePollDialog />
          </CardContent>
        </Card>
      )}
      <PreviousPolls />
    </TabsContent>
  );
};

export default PollmonitorTab;
