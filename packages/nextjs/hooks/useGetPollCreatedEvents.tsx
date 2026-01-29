import React from "react";
import { useDeployedContractInfo } from "./scaffold-eth";
import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";

const useGetPollCreatedEvents = (activePollId: bigint | undefined) => {
  const publicClient = usePublicClient();
  const deploymentBlock = BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || "0");
  const { data: contractData } = useDeployedContractInfo({
    contractName: "Voting",
  });

  const { data: pollCreatedEvents, refetch } = useQuery({
    // Standard 2026 Query Key pattern
    queryKey: ["pollCreatedEvents", publicClient?.chain.id],
    queryFn: async () => {
      if (!publicClient) return [];

      return await publicClient.getLogs({
        address: contractData!.address,
        event: parseAbiItem(
          "event PollCreated(uint256 indexed pollId,string question,uint256 startTime,uint256 endTime)",
        ),
        args: { pollId: activePollId },
        fromBlock: deploymentBlock,
        toBlock: "latest",
      });
    },
    enabled: !!publicClient && !!contractData && activePollId !== undefined,
    // Optimization: History doesn't change every second, refresh every 30s
    refetchInterval: 30000,
    // staleTime: 15000,
  });

  const pollIds = React.useMemo(() => {
    if (!pollCreatedEvents) return [];
    return pollCreatedEvents.map(e => e.args.pollId).slice(0, 3);
  }, [pollCreatedEvents]);

  return { pollIds, refetch };
};

export default useGetPollCreatedEvents;
