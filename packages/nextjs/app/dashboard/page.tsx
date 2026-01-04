"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import useVoterData from "~~/hooks/useVoterData";

const VotingPage: NextPage = () => {
  const { registered } = useVoterData();
  const router = useRouter();
  const pathname = usePathname();

  const { address: userAddress, isConnected, status } = useAccount();
  console.log(userAddress);
  useEffect(() => {
    if (status !== "connecting" && pathname.startsWith("/dashboard")) {
      if (!isConnected && !registered) router.replace("/");
    }
  }, [registered, router, isConnected, pathname, status]);

  return <div>Vote Here</div>;
};

export default VotingPage;
