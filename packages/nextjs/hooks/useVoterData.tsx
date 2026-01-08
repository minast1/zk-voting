"use client";

import { useEffect, useState } from "react";
import { useScaffoldReadContract } from "./scaffold-eth";
import { useAccount } from "wagmi";

const useVoterData = () => {
  const { address: userAddress } = useAccount();
  const [canRegister, setCanRegister] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { data: voterData } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getVoterData",
    args: [userAddress],
  });

  useEffect(() => {
    if (voterData) {
      const isVoter = Boolean(voterData[0]);
      const hasRegistered = Boolean(voterData[1]);
      setCanRegister(Boolean(!isVoter && !hasRegistered));
      setCanVote(Boolean(!isVoter && hasRegistered));
      setRegistered(Boolean(hasRegistered));
    }
  }, [voterData]);

  //console.log({ canRegister, registered, canVote });
  return {
    canRegister,
    registered,
    canVote,
  };
};

export default useVoterData;
