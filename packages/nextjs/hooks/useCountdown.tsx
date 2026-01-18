import { useTargetNetwork } from "./scaffold-eth";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { useChallengeStore } from "~~/services/store/zk-store";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(expiresAt: bigint | undefined): CountdownResult {
  const currentPollId = useChallengeStore(state => state.currentPollid);
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork?.id });
  const { data } = useQuery({
    queryKey: ["countdown", expiresAt?.toString(), currentPollId],
    queryFn: async () => {
      const block = await publicClient?.getBlock({ blockTag: "latest" });
      const networkTime = block?.timestamp || BigInt(Math.floor(Date.now() / 1000));
      const systemTime = BigInt(Math.floor(Date.now() / 1000));
      const offset = networkTime - systemTime;
      return calculateTimeLeft(expiresAt, offset);
    },
    enabled: typeof expiresAt === "bigint" && !!currentPollId && !!publicClient,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    initialData: () => calculateTimeLeft(expiresAt, 0n),
  });

  return (
    data ?? {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      formatted: "No expiry",
    }
  );
}

function calculateTimeLeft(expiresAt: bigint | undefined, offset: bigint): CountdownResult {
  if (typeof expiresAt !== "bigint") {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      formatted: "No expiry",
    };
  }

  const nowWithOffset = BigInt(Math.floor(Date.now() / 1000)) + offset;
  const difference = expiresAt - nowWithOffset;

  if (difference <= 0n) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: "Expired",
    };
  }

  const SECOND = 1n;
  const MINUTE = 60n * SECOND;
  const HOUR = 60n * MINUTE;
  const DAY = 24n * HOUR;

  const days = difference / DAY;
  const hours = (difference % DAY) / HOUR;
  const minutes = (difference % HOUR) / MINUTE;
  const seconds = (difference % MINUTE) / SECOND;
  //Convert to numbers for ui
  const d = Number(days);
  const h = Number(hours);
  const m = Number(minutes);
  const s = Number(seconds);

  let formatted: string;
  if (d > 0) {
    formatted = `${d}d ${h}h`;
  } else if (h > 0) {
    formatted = `${h}h ${m}m`;
  } else if (m > 0) {
    formatted = `${m}m ${s}s`;
  } else {
    formatted = `${s}s`;
  }

  return {
    days: d,
    hours: h,
    minutes: m,
    seconds: s,
    isExpired: false,
    formatted,
  };
}
