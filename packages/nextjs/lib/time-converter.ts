export const timeAgo = (timestamp: bigint | number) => {
  // 1. Convert blockchain timestamp (seconds) to milliseconds
  const startTimeMs = Number(timestamp) * 1000;

  // 2. Calculate the difference (delta) in seconds
  const seconds = Math.floor((Date.now() - startTimeMs) / 1000);

  // 3. Handle future timestamps or very recent ones
  if (seconds < 30) return "just now";

  // 4. Step-up logic using the 'seconds' delta
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  // 5. Fallback for very old events (standard 2026 practice)
  return new Date(startTimeMs).toLocaleDateString();
};
