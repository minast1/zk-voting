import { useQuery } from "@tanstack/react-query";

//import { useChallengeStore } from "~~/services/store/zk-store";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(expiresAt: bigint, currentPollId: number): CountdownResult {
  //const setCurrentPollId = useChallengeStore(state => state.setCurrentPollId);
  //const setExpiresAt = useChallengeStore(state => state.setExpiresAt);
  // const setCurrentPollQuestion = useChallengeStore(state => state.setCurrentPollQuestion);
  const { data } = useQuery({
    // Use string representation for queryKey to avoid BigInt serialization issues
    queryKey: ["countdown", expiresAt?.toString(), currentPollId],
    queryFn: () => calculateTimeLeft(expiresAt),
    // Fix: Check for bigint type
    enabled: typeof expiresAt === "bigint" && currentPollId !== undefined,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    //initialData: () => calculateTimeLeft(expiresAt),
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

function calculateTimeLeft(expiresAt: bigint): CountdownResult {
  // // 1. Correct Type Check
  // if (typeof expiresAt !== "bigint") {
  //   return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, formatted: "No expiry" };
  // }

  // 2. BigInt Constants (Timestamps are usually in seconds in Solidity)
  const now = BigInt(Math.floor(Date.now() / 1000));
  const difference = expiresAt - now;

  if (difference <= 0n) {
    // Poll has expired
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "Expired" };
  }

  // 3. BigInt Math (Avoids Number precision loss for large timestamps)
  const SECOND = 1n;
  const MINUTE = 60n * SECOND;
  const HOUR = 60n * MINUTE;
  const DAY = 24n * HOUR;

  const days = difference / DAY;
  const hours = (difference % DAY) / HOUR;
  const minutes = (difference % HOUR) / MINUTE;
  const seconds = (difference % MINUTE) / SECOND;

  // 4. Convert to Number for UI/Formatting
  const d = Number(days);
  const h = Number(hours);
  const m = Number(minutes);
  const s = Number(seconds);

  let formatted: string;
  if (d > 0) formatted = `${d}d ${h}h`;
  else if (h > 0) formatted = `${h}h ${m}m`;
  else if (m > 0) formatted = `${m}m ${s}s`;
  else formatted = `${s}s`;

  return {
    days: d,
    hours: h,
    minutes: m,
    seconds: s,
    isExpired: false,
    formatted,
  };
}
