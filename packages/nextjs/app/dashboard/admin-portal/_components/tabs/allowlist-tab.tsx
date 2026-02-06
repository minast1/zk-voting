import React from "react";
import AllowListSkeleton from "../allowlist-skeleton";
import { Trash2, Users } from "lucide-react";
import { Address } from "~~/components/Address/address";
import { AddVoterDialog } from "~~/components/dialogs/add-voter";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent } from "~~/components/ui/card";
import { TabsContent } from "~~/components/ui/tabs";
import { useIsMobile } from "~~/hooks/useIsMobile";
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
//import { useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";
import { useChallengeStore } from "~~/services/store/zk-store";

const AllowListTab = () => {
  const pollId = useChallengeStore(state => state.currentPollid);
  const { approvalLogs, isLoading } = useVoterManagementLIst(pollId ? BigInt(pollId) : undefined);
  const isMobile = useIsMobile();
  return (
    <TabsContent value="voters" className="space-y-4">
      {isLoading ? (
        <AllowListSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Voter Allowlist</h2>
            <AddVoterDialog />
          </div>

          <Card className="glass-card border-border/50">
            {!approvalLogs || approvalLogs.length === 0 ? (
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No Voters Added</p>
                <p className="text-sm text-muted-foreground mb-4">Add EOA addresses to allow voting</p>
                <AddVoterDialog />
              </CardContent>
            ) : (
              <CardContent className="md:py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {approvalLogs.map((event, i) => (
                    <div key={i} className="flex items-center justify-between md:p-3 rounded-lg bg-secondary/30 group">
                      <div className="flex items-center gap-5">
                        <Badge variant="warning">{/* {voter.allowed ? "Allowed" : "Revoked"} */} Allowed</Badge>
                        <Address address={event.args.voter} format={isMobile ? "short" : "long"} onlyEnsOrAddress />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        //onClick={() => handleRemoveVoter(voter.eoa)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </TabsContent>
  );
};

export default AllowListTab;
