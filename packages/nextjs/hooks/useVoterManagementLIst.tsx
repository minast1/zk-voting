import React, { useMemo } from "react";
import { useDeployedContractInfo } from "./scaffold-eth";
import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { useAccount, usePublicClient } from "wagmi";

type VoterStatus = "pending" | "approved" | "none";
export interface VoterRequest {
  address: string;
  status: VoterStatus;
  timestamp: bigint;
  addedByAdmin: boolean;
}

const ACCESS_REQUESTED_ABI = parseAbiItem(
  "event AccessRequested(uint256 indexed pollId,address indexed requester,uint256 timestamp)",
);
const VOTER_ADDED_ABI = parseAbiItem("event VoterAdded(address indexed voter, uint256 indexed poll_id)");

const VOTER_REGISTERED_ABI = parseAbiItem(
  "event CommitmentRegistered(uint256 indexed pollId, uint256 indexed index, uint256 value)",
);
const useVoterManagementLIst = (pollId: bigint | undefined) => {
  // const {targetNetwork} = useTargetNetwork();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: contractData } = useDeployedContractInfo({
    contractName: "Voting",
  });
  const {
    data: logs,
    isLoading,
    refetch,
  } = useQuery({
    enabled: !!publicClient && !!contractData && pollId !== undefined,
    queryKey: ["voterManagement", contractData?.address, pollId?.toString()],
    queryFn: async () => {
      //Fetch both sets of logs in parallel
      const [requestLogs, approvalLogs, voterRegisteredLogs] = await Promise.all([
        publicClient!.getLogs({
          address: contractData!.address,
          fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || 0), //use deployment block as fromBlock
          event: ACCESS_REQUESTED_ABI,
          args: { pollId },
        }),

        publicClient!.getLogs({
          address: contractData!.address,
          fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || 0),
          event: VOTER_ADDED_ABI,
          args: { poll_id: pollId },
        }),

        publicClient!.getLogs({
          address: contractData!.address,
          fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || 0),
          event: VOTER_REGISTERED_ABI,
          args: { pollId },
        }),
      ]);

      return { requestLogs, approvalLogs, voterRegisteredLogs };
    },
    //staleTime: 5 * 60 * 1000, // Consider logs "fresh" for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 20000, // Refresh every 20 seconds
  });

  const voterManagementList = React.useMemo(() => {
    if (!logs || pollId === undefined) return [];

    // const approvedSet = new Set(logs.approvalLogs?.map(e => e.args.voter?.toLocaleLowerCase()));

    const voterMap = new Map<string, VoterRequest>();

    logs.requestLogs.forEach(req => {
      const addr = req.args.requester as string;
      voterMap.set(addr.toLocaleLowerCase(), {
        address: addr,
        status: "pending",
        timestamp: req.args.timestamp || 0n,
        addedByAdmin: false,
      } as VoterRequest);
    });

    logs.approvalLogs.forEach(req => {
      const addr = (req.args.voter as string).toLocaleLowerCase();
      const existing = voterMap.get(addr);
      if (existing) {
        //has been approved
        existing.status = "approved";
      } else {
        voterMap.set(addr, {
          address: addr,
          status: "approved",
          timestamp: 0n,
          addedByAdmin: true,
        });
      }
    });
    return Array.from(voterMap.values()).sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [logs, pollId]);

  const voterStatus = useMemo((): VoterStatus => {
    if (!userAddress || !pollId || !logs?.requestLogs) return "none";

    const userRequest = voterManagementList.find(
      v => v.address.toLocaleLowerCase() === userAddress.toLocaleLowerCase(),
    );

    return userRequest?.status || "none";
  }, [userAddress, pollId, logs?.requestLogs, voterManagementList]);

  return {
    voterManagementList,
    voterStatus,
    isLoading,
    approvalLogs: logs?.approvalLogs,
    voterRegisteredLogs: logs?.voterRegisteredLogs,
    refetch,
  };
};

export default useVoterManagementLIst;
