"use client";

import { useEffect, useState } from "react";
import { useScaffoldEventHistory } from "../../hooks/scaffold-eth/useScaffoldEventHistory";
//import { usePathname, useRouter } from "next/navigation";
import { NextPage } from "next";
import { EmptyState } from "~~/app/dashboard/_components/empty-state";
import { PollCard } from "~~/app/dashboard/_components/poll-card";
//import useVoterData from "~~/hooks/useVoterData";
import { CreatePollDialog } from "~~/components/dialogs/create-poll";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Poll } from "~~/lib/voting";

const VotingPage: NextPage = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { data: votingData } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getVotingData",
  });

  const { data: leafEvents } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "NewLeaf",
    watch: true,
    enabled: true,
  });
  useEffect(() => {
    if (votingData) {
      setPolls(prev => [
        {
          id: "1",
          question: votingData[0],
          createdAt: Number(votingData[7]),
          createdBy: votingData[1],
          yesVotes: Number(votingData[2]),
          noVotes: Number(votingData[3]),
          voters: ["0x7874665bf5da57d222de629d4c6ba9ae619076f0", "0xb99DF0373C051719Eb974707061f9E498892C010"],
          size: Number(votingData[4]),
          depth: Number(votingData[5]),
          root: votingData[6].toString(), // Hashed voter IDs (anonymized)
          status: "active",
        },
        ...prev,
      ]);
    }
  }, [votingData]);

  const handlePollCreated = (poll: Poll) => {
    setPolls([poll, ...polls]);
  };

  // const { registered } = useVoterData();
  // const router = useRouter();
  // const pathname = usePathname();

  // const { address: userAddress, isConnected, status } = useAccount();
  // console.log(registered);
  // useEffect(() => {
  //   if (status !== "connecting" && pathname.startsWith("/dashboard")) {
  //     if (!isConnected && !registered) router.replace("/");
  //   }
  // }, [registered, router, isConnected, pathname, status]);

  return (
    <>
      <div className="space-y-8">
        {/* Welcome + Create */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold">Active Polls</h2>
            <p className="text-muted-foreground">Cast your anonymous vote on any active poll below</p>
          </div>
          <CreatePollDialog voterHash={"asdfhghgagad-agdsdsfds0fdsfd"} onPollCreated={handlePollCreated} />
        </div>

        {polls.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {polls.map((poll, index) => (
              <PollCard
                key={index}
                poll={poll}
                voterHash={"adf;lgagla343433 l43n4l34343"}
                voterId={"ggfgfgfgtretererrerereer"}
                leafEvents={leafEvents}
                animationDelay={index * 100}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default VotingPage;
