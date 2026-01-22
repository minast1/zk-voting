import React from "react";
import { useScaffoldEventHistory } from "./scaffold-eth/useScaffoldEventHistory";
import { useAccount } from "wagmi";

type VoterStatus = "pending" | "approved" | "none";
export interface VoterRequest {
  address: string;
  status: VoterStatus;
  timestamp: bigint;
}
const useVoterManagementLIst = (pollId: bigint | undefined) => {
  const { address: userAddress } = useAccount();
  const { data: requestLogs, isLoading: loadingRequests } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "AccessRequested",
    filters: { pollId: pollId },
    fromBlock: 0n,
    watch: true,
    enabled: pollId !== undefined,
  });

  const { data: approvalLogs, isLoading: loadingApprovals } = useScaffoldEventHistory({
    contractName: "Voting",
    eventName: "VoterAdded",
    filters: { poll_id: pollId },
    fromBlock: 0n,
    watch: true,
    enabled: pollId !== undefined,
  });

  const voterManagementList = React.useMemo(() => {
    if (!requestLogs) return [];

    const approvedSet = new Set(approvalLogs?.map(e => e.args.voter?.toLocaleLowerCase()));

    return requestLogs
      .map(req => {
        const addr = req.args.requester as string;
        const isApproved = approvedSet.has(addr.toLocaleLowerCase());

        return {
          address: addr,
          status: isApproved ? "approved" : "pending",
          timestamp: req.args.timestamp as bigint,
        } as VoterRequest;
      })
      .sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [requestLogs, approvalLogs]);

  const getVoterStatus = (): VoterStatus => {
    if (!userAddress || !pollId || !requestLogs) return "none";

    const userRequest = voterManagementList.find(
      v => v.address.toLocaleLowerCase() === userAddress.toLocaleLowerCase(),
    );

    return userRequest?.status || "none";
  };

  return {
    voterManagementList,
    getVoterStatus,
    isLoading: loadingRequests || loadingApprovals,
  };
};

export default useVoterManagementLIst;
