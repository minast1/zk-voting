import React from "react";
import { useDeployedContractInfo } from "./scaffold-eth";
import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { useAccount, usePublicClient } from "wagmi";

type VoterStatus = "pending" | "approved" | "none";
export interface VoterRequest {
  address: string;
  status: VoterStatus;
  timestamp: bigint;
}

const ACCESS_REQUESTED_ABI = parseAbiItem(
  "event AccessRequested(uint256 indexed pollId,address indexed requester,uint256 timestamp)",
);
const VOTER_ADDED_ABI = parseAbiItem("event VoterAdded(address indexed voter, uint256 indexed poll_id)");

const useVoterManagementLIst = (pollId: bigint | undefined) => {
  // const {targetNetwork} = useTargetNetwork();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: contractData } = useDeployedContractInfo({
    contractName: "Voting",
  });
  const { data: logs, isLoading } = useQuery({
    enabled: !!publicClient && !!contractData && pollId !== undefined,
    queryKey: ["voterManagement", contractData?.address, pollId?.toString],
    queryFn: async () => {
      //Fetch both sets of logs in parallel
      const [requestLogs, approvalLogs] = await Promise.all([
        publicClient!.getLogs({
          address: contractData!.address,

          fromBlock: 0n,
          toBlock: "latest",
          event: ACCESS_REQUESTED_ABI,
          args: { pollId },
        }),

        publicClient!.getLogs({
          address: contractData!.address,

          fromBlock: 0n,
          toBlock: "latest",
          event: VOTER_ADDED_ABI,
          args: { poll_id: pollId },
        }),
      ]);

      return { requestLogs, approvalLogs };
    },
    refetchInterval: 5000, //5seconds
  });

  const voterManagementList = React.useMemo(() => {
    if (!logs?.requestLogs) return [];

    const approvedSet = new Set(logs.approvalLogs?.map(e => e.args.voter?.toLocaleLowerCase()));

    const uniqueRequests = new Map<string, VoterRequest>();

    logs.requestLogs.forEach(req => {
      const addr = req.args.requester as string;
      const isApproved = approvedSet.has(addr.toLocaleLowerCase());

      uniqueRequests.set(addr.toLocaleLowerCase(), {
        address: addr,
        status: isApproved ? "approved" : "pending",
        timestamp: req.args.timestamp || 0n,
      } as VoterRequest);
    });
    return Array.from(uniqueRequests.values()).sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [logs]);
  const getVoterStatus = (): VoterStatus => {
    if (!userAddress || !pollId || !logs?.requestLogs) return "none";

    const userRequest = voterManagementList.find(
      v => v.address.toLocaleLowerCase() === userAddress.toLocaleLowerCase(),
    );

    return userRequest?.status || "none";
  };

  return {
    voterManagementList,
    getVoterStatus,
    isLoading,
    approvalLogs: logs?.approvalLogs,
  };
};

export default useVoterManagementLIst;
