"use client";

import ActivePoll from "./_components/cards/active-poll";
import AllowedVoters from "./_components/cards/allowed-voters";
import PendingRequests from "./_components/cards/pending-requests";
import TotalPolls from "./_components/cards/total-polls";
import PollmonitorTab from "./_components/tabs/pollmonitor-tab";
import { ClipboardList, Trash2, Users } from "lucide-react";
import { NextPage } from "next";
import { AddVoterDialog } from "~~/components/dialogs/add-voter";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent } from "~~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";

const VotingPage: NextPage = () => {
  // const pendingRequests = accessRequests.filter(r => r.status === "pending");

  // const handleApprove = (requestId: string) => {
  //   approveAccessRequest(requestId);
  //   refreshData();
  //   toast.success('Request approved');
  // };

  // const handleReject = (requestId: string) => {
  //   rejectAccessRequest(requestId);
  //   refreshData();
  //   toast.success('Request rejected');
  // };

  // const handleRemoveVoter = (eoa: string) => {
  //   removeAllowedVoter(eoa);
  //   refreshData();
  //   toast.success('Voter removed from allowlist');
  // };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Overview */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <ActivePoll />
          <TotalPolls />
          <AllowedVoters />
          <PendingRequests />
        </div>

        <Tabs defaultValue="polls" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="voters">Allowlist</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Requests
              {/* {pendingRequests.length > 0 && ( */}
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs justify-center">
                5
              </Badge>
              {/* )} */}
            </TabsTrigger>
          </TabsList>

          <PollmonitorTab />

          <TabsContent value="voters" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Voter Allowlist</h2>
              <AddVoterDialog />
            </div>
            {/* {allowedVoters.length === 0 ? ( */}
            <Card className="glass-card border-border/50 border-dashed">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No Voters Added</p>
                <p className="text-sm text-muted-foreground mb-4">Add EOA addresses to allow voting</p>
                <AddVoterDialog />
              </CardContent>
            </Card>
            ) : (
            <Card className="glass-card border-border/50">
              <CardContent className="py-4">
                <div className="space-y-2">
                  {/* {allowedVoters.map((voter, i) => ( */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 group">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="default"
                        // {voter.allowed ? "default" : "destructive"}
                      >
                        {/* {voter.allowed ? "Allowed" : "Revoked"} */} Allowed
                      </Badge>
                      {/* <span className="font-mono text-sm">{voter.eoa}</span> */}
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
                  {/* ))} */}
                </div>
              </CardContent>
            </Card>
            {/* )} */}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-xl font-semibold">Access Requests</h2>
            {/* {pendingRequests.length === 0 ? ( */}
            <Card className="glass-card border-border/50 border-dashed">
              <CardContent className="py-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No Pending Requests</p>
                <p className="text-sm text-muted-foreground">Access requests from voters will appear here</p>
              </CardContent>
            </Card>
            ) : (
            <div className="space-y-3">
              {/* {pendingRequests.map(request => (
                  <Card key={request.id} className="glass-card border-border/50">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-mono text-sm">{request.eoa}</p>
                          {request.reason && <p className="text-xs text-muted-foreground mt-1">{request.reason}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-success hover:text-success"
                            // onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive hover:text-destructive"
                            // onClick={() => handleReject(request.id)}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )} */}
            </div>
            {/* {accessRequests.filter(r => r.status !== "pending").length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-muted-foreground">Past Requests</h3>
                {accessRequests
                  .filter(r => r.status !== "pending")
                  .map(request => (
                    <Card key={request.id} className="glass-card border-border/50 opacity-70">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{request.eoa}</span>
                          <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                            {request.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )} */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default VotingPage;
