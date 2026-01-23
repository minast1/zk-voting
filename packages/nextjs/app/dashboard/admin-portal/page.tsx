"use client";

import { useMemo } from "react";
import Link from "next/link";
import ActivePoll from "./_components/cards/active-poll";
import AllowedVoters from "./_components/cards/allowed-voters";
import PendingRequests from "./_components/cards/pending-requests";
import TotalPolls from "./_components/cards/total-polls";
import AllowListTab from "./_components/tabs/allowlist-tab";
import PendingRequestsTab from "./_components/tabs/pending-requests";
import PollmonitorTab from "./_components/tabs/pollmonitor-tab";
import { ArrowLeft } from "lucide-react";
import { NextPage } from "next";
import { Badge } from "~~/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import useVoterManagementLIst from "~~/hooks/useVoterManagementLIst";
import { useChallengeStore } from "~~/services/store/zk-store";

const VotingPage: NextPage = () => {
  const poll_id = useChallengeStore(state => state.currentPollid);
  const { voterManagementList: requests } = useVoterManagementLIst(poll_id ? BigInt(poll_id) : undefined);
  const pendingRequests = useMemo(() => requests.filter(v => v.status === "pending"), [requests]);
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage polls & voters</p>
            </div>
          </div>
          {/* <div className="flex items-center gap-3">
            <AddVoterDialog />
            <CreatePollDialog onPollCreated={refreshData} />
          </div> */}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
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
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs justify-center">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <PollmonitorTab />

          <AllowListTab />
          <PendingRequestsTab />
        </Tabs>
      </main>
    </div>
  );
};

export default VotingPage;
