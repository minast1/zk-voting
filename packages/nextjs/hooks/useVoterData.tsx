"use client";

import { useScaffoldReadContract } from "./scaffold-eth";
import { useAccount } from "wagmi";

const useVoterData = () => {
  const { address: userAddress, isConnected } = useAccount();
  const { data: voterData } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getVoterData",
    args: [userAddress],
  });
  const isVoter = voterData?.at(0);

  const hasRegistered = voterData?.at(1);
  const canRegister = Boolean(isConnected && !isVoter && !hasRegistered);
  const registered = Boolean(isConnected && hasRegistered);
  const canVote = Boolean(isConnected && !isVoter && hasRegistered);

  return {
    canRegister,
    registered,
    canVote,
  };
};

export default useVoterData;
