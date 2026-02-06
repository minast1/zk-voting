import React, { useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { Address } from "~~/components/Address/address";
import { queryClient } from "~~/components/ScaffoldEthAppWithProviders";
import { Badge } from "~~/components/ui/badge";
//import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent } from "~~/components/ui/card";
import { Spinner } from "~~/components/ui/spinner";
import { TabsContent } from "~~/components/ui/tabs";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useIsMobile } from "~~/hooks/useIsMobile";
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
import { useChallengeStore } from "~~/services/store/zk-store";
import { notification } from "~~/utils/scaffold-eth";

const PendingRequestsTab = () => {
  const poll_id = useChallengeStore(state => state.currentPollid);
  const [isLoading, setIsLoading] = useState(false);
  const { voterManagementList } = useVoterManagementLIst(poll_id ? BigInt(poll_id) : undefined);
  const { data: votingContractInfo } = useDeployedContractInfo({ contractName: "Voting" });

  const pendingRequests = voterManagementList.filter(v => v.status === "pending");
  const isMobile = useIsMobile();

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "Voting" });
  const handleApprove = async (requester: string) => {
    if (!votingContractInfo) return;
    setIsLoading(true);
    try {
      await writeContractAsync(
        {
          functionName: "addVoters",
          args: [[requester], BigInt(poll_id || 0n), [true]],
        },

        {
          onSuccess: async () => {
            const previousData: any = queryClient.getQueryData([
              "voterManagement",
              votingContractInfo.address,
              poll_id?.toString(),
            ]);
            queryClient.setQueryData(
              ["voterManagement", votingContractInfo.address, poll_id?.toString()],
              (oldData: any) => {
                if (!oldData) {
                  return oldData;
                }
                const updatedLogs = {
                  ...oldData,
                  approvalLogs: [
                    ...(oldData.approvalLogs || []),
                    {
                      args: { voter: pendingRequests[0].address, poll_id: BigInt(poll_id || 0) },
                      // Add dummy values to satisfy the log object structure if needed
                      blockNumber: 0n,
                      transactionHash: "pending",
                    },
                  ],
                  voterRegsteredLogs: oldData.voterRegsteredLogs,
                };

                console.log(updatedLogs);
                return updatedLogs;
              },
            );
            return { previousData };
          },
          blockConfirmations: 1,
          onBlockConfirmation: async () => {
            // await queryClient.invalidateQueries({
            //   queryKey: ["voterManagement", votingContractInfo.address, poll_id?.toString()],
            // });
            setIsLoading(false);
          },
        },
      );
    } catch (error) {
      notification.error(error instanceof Error ? error.message : String(error));
      setIsLoading(false);
    }
  };

  // return isLoadingData ? (
  //   <RequestsSkeleton />
  // ) : (
  return (
    <TabsContent value="requests" className="space-y-4">
      <h2 className="text-xl font-semibold">Access Requests</h2>

      {pendingRequests.length === 0 ? (
        <Card className="glass-card border-border/50 border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No Pending Requests</p>
            <p className="text-sm text-muted-foreground">Access requests from voters will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map(request => (
            <Card key={Number(request.timestamp)} className="glass-card border-border/50">
              <CardContent className="md:py-4">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <div className="flex-1">
                    <Address address={request.address} format={isMobile ? "short" : "long"} />

                    <p className="text-xs text-muted-foreground mt-1">Requested {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-success hover:text-success"
                      onClick={() => handleApprove(request.address)}
                    >
                      {" "}
                      {isLoading ? (
                        <>
                          <Spinner className="mr-2" />
                          Submitting..
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    {/* <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:text-destructive"
                      //onClick={() => handleReject(request.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {voterManagementList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-muted-foreground">Past Requests</h3>
          {voterManagementList
            .filter(req => req.status === "approved" && req.addedByAdmin === false)
            .map((req, idx) => (
              <Card key={idx} className="glass-card border-border/50 opacity-70">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <Address address={req.address} format={isMobile ? "short" : "long"} />
                    <Badge variant="default">approved</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </TabsContent>
  );
};

export default PendingRequestsTab;
