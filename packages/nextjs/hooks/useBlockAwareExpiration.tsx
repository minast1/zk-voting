import { useState } from "react";
import { useScaffoldReadContract, useTargetNetwork } from "./scaffold-eth";
import { usePublicClient, useWatchBlockNumber } from "wagmi";
import { useChallengeStore } from "~~/services/store/zk-store";

export function useBlockAwareExpiration() {
  const [status, setStatus] = useState<"active" | "expired" | undefined>(undefined);
  const resetStore = useChallengeStore(state => state.reset);
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const { data: currentPollid } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getPollCount",
  });

  const { data: currentPollData } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getPoll",
    args: [currentPollid],
    query: {
      enabled: currentPollid !== undefined,
    },
  });

  useWatchBlockNumber({
    emitOnBegin: true,
    enabled: currentPollData !== undefined,
    poll: true,
    onBlockNumber: async blockNumber => {
      // 1. Guard: Only check if there is an active poll to watch
      if (!currentPollData || !currentPollid || !publicClient) return;

      try {
        const expiresAt = currentPollData[4];
        // 2. Fetch the latest block to get the actual network timestamp
        const block = await publicClient.getBlock({ blockNumber });
        const networkTime = block.timestamp;

        console.log(`Block ${blockNumber} | Network Time: ${networkTime} | Expiry: ${expiresAt}`);

        // 3. Compare: If blockchain time has passed the end time, trigger reset
        if (networkTime >= expiresAt) {
          console.log("On-chain confirmation: Poll has ended.");
          setStatus("expired");
          resetStore();
        } else {
          setStatus("active");
        }
      } catch (error) {
        console.error("Failed to fetch block for expiration check:", error);
      }
    },
  });

  return { status, currentPollid };
}
