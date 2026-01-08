// Simulated cryptographic functions for Sybil-resistance
// In production, this would use ZK proofs or similar technology

export interface Poll {
  id: string;
  question: string;
  createdAt: number;
  createdBy: string;
  yesVotes: number;
  noVotes: number;
  size: number;
  depth: number;
  root: string;
  voters: string[]; // Hashed voter IDs (anonymized)
  status: "active" | "closed";
  expiresAt?: number;
}

export interface VoterIdentity {
  hashedId: string;
  originalId: string; // Stored locally for ZK proof generation
  registeredAt: number;
  isRegistered: boolean;
}

// Simple hash function for demo purposes
// In production, use proper cryptographic hashing
export function hashVoterId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// Generate a commitment that proves vote without revealing choice
export function generateVoteCommitment(voterId: string, pollId: string): string {
  return hashVoterId(`${voterId}-${pollId}-${Date.now()}`);
}

// ZK Proof types and functions (simulated for demo)

// Generate a simulated ZK proof for voting eligibility

// Verify a ZK proof (simulated verification)

// Check if a voter has already voted in a poll
export function hasVotedInPoll(voterHash: string, poll: Poll): boolean {
  return poll.voters.includes(voterHash);
}

// Storage keys
const POLLS_KEY = "anon-vote-polls";
const VOTER_KEY = "anon-vote-voter";
const ALLOWED_VOTERS_KEY = "anon-vote-allowed-voters";

// Allowed voters management
export function getAllowedVoters(): string[] {
  const stored = localStorage.getItem(ALLOWED_VOTERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addAllowedVoter(voterId: string): void {
  const allowed = getAllowedVoters();
  if (!allowed.includes(voterId)) {
    allowed.push(voterId);
    localStorage.setItem(ALLOWED_VOTERS_KEY, JSON.stringify(allowed));
  }
}

export function isVoterAllowed(voterId: string): boolean {
  const allowed = getAllowedVoters();
  return allowed.includes(voterId);
}

// Poll management
export function getPolls(): Poll[] {
  const stored = localStorage.getItem(POLLS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePoll(poll: Poll): void {
  const polls = getPolls();
  const existingIndex = polls.findIndex(p => p.id === poll.id);
  if (existingIndex >= 0) {
    polls[existingIndex] = poll;
  } else {
    polls.unshift(poll);
  }
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
}

// export function createPoll(question: string, creatorHash: string): Poll {
//   const poll: Poll = {
//     id: crypto.randomUUID(),
//     question,
//     createdAt: Date.now(),
//     createdBy: creatorHash,
//     yesVotes: 0,
//     noVotes: 0,
//     voters: [],
//     status: "active",
//   };
//   savePoll(poll);
//   return poll;
// }

export function registerVoter(uniqueId: string): VoterIdentity {
  const hashedId = hashVoterId(uniqueId);
  const identity: VoterIdentity = {
    hashedId,
    originalId: uniqueId,
    registeredAt: Date.now(),
    isRegistered: true,
  };
  localStorage.setItem(VOTER_KEY, JSON.stringify(identity));
  return identity;
}

export function clearVoterIdentity(): void {
  localStorage.removeItem(VOTER_KEY);
}
