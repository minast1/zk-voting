import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CommitmentData {
  commitment: string;
  nullifier: string;
  secret: string;
  index?: number;
}

type ProofData = {
  proof: Uint8Array;
  publicInputs: any[];
};

interface SerializedUint8Array {
  __type: "Uint8Array";
  data: number[];
}

interface SerializedBigInt {
  __type: "BigInt";
  value: string;
}
type SerializedData = SerializedUint8Array | SerializedBigInt;
// Type guard to verify the format during rehydration
function isSerializedData(value: any): value is SerializedData {
  return (
    value !== null &&
    typeof value === "object" &&
    "__type" in value &&
    (value.__type === "Uint8Array" || value.__type === "BigInt")
  );
  // return (
  //   (typeof value === "object" && value !== null && "__type" in value && (value as any).__type === "Uint8Array") ||
  //   (value as any).__type === "BigInt"
  // );
}

interface ChallengeState {
  commitmentData: CommitmentData | null;
  proofData: ProofData | null;
  hasHydrated: boolean;
  circuitData: any | null;
  voteChoice: boolean | null;
  proofGenerated: boolean;
  hasVoted: boolean;
  currentPollid: number | undefined;
  currentPollQuestion: string | undefined;
  expiresAt: bigint | undefined;
}

interface ChallengeActions {
  setCommitmentData: (data: CommitmentData | null) => void;
  setProofData: (data: ProofData | null) => void;
  setHasHydrated: (state: boolean) => void;
  setCircuitData: (data: any | null) => void;
  setVoteChoice: (choice: boolean | null) => void;
  setProofGenerated: (generated: boolean) => void;
  setHasVoted: (hasVoted: boolean) => void;
  setCurrentPollId: (id: number | undefined) => void;
  setCurrentPollQuestion: (question: string | undefined) => void;
  setExpiresAt: (expiresAt: bigint | undefined) => void;
  updateCommitmentIndex: (index: number) => void;
  reset: () => void;
}

//const PROOF_STORAGE_KEY_PREFIX = "zk-voting-proof-data";
const initialState = {
  commitmentData: null,
  proofData: null,
  voteChoice: null,
  circuitData: null,
  proofGenerated: false,
  hasVoted: false,
  currentPollid: undefined,
  expiresAt: undefined,
  currentPollQuestion: undefined,
  hasHydrated: false,
};
export const useChallengeStore = create<ChallengeState & ChallengeActions>()(
  persist(
    set => ({
      ...initialState,
      //updaters
      setCommitmentData: data => set({ commitmentData: data }),
      setProofGenerated: generated => set({ proofGenerated: generated }),
      setProofData: data => set({ proofData: data }),
      setVoteChoice: choice => set({ voteChoice: choice }),
      setCircuitData: data => set({ circuitData: data }),
      setHasVoted: hasVoted => set({ hasVoted }),
      setCurrentPollId: id => set({ currentPollid: id }),
      setExpiresAt: expiresAt => set({ expiresAt }),
      setHasHydrated: state => set({ hasHydrated: state }),
      setCurrentPollQuestion: question => set({ currentPollQuestion: question }),
      updateCommitmentIndex: index =>
        set(state => ({
          commitmentData: state.commitmentData ? { ...state.commitmentData, index } : state.commitmentData,
        })),
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "zk-voting-store-v2026",
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...(persistedState as object),
      }),
      partialize: state => ({
        commitmentData: state.commitmentData,
        proofData: state.proofData,
        voteChoice: state.voteChoice,
        circuitData: state.circuitData,
        proofGenerated: state.proofGenerated,
        hasVoted: state.hasVoted,
        currentPollid: state.currentPollid,
        expiresAt: state.expiresAt,
        currentPollQuestion: state.currentPollQuestion,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => {
        //state?.setHasHydrated?.(true);
        return (state, error) => {
          if (error) {
            console.log("an error happened during hydration", error);
          } else {
            state?.setHasHydrated?.(true);
          }
        };
      },
      storage: createJSONStorage(() => localStorage, {
        // Recursively finds any Uint8Array in your object tree (including nested ones)
        replacer: (key, value) => {
          // If the property being processed is a Uint8Array (like proofData.proof)
          if (value instanceof Uint8Array) {
            return {
              __type: "Uint8Array",
              data: Array.from(value),
            } as SerializedUint8Array;
          }

          // 2. Add BigInt Support
          if (typeof value === "bigint") {
            return { __type: "BigInt", value: value.toString() } as SerializedBigInt; //value.toString();
          }
          return value;
        },
        // Recursively reconstructs Uint8Array during rehydration
        reviver: (key, value) => {
          if (isSerializedData(value)) {
            if (value.__type === "Uint8Array") {
              return new Uint8Array(value.data);
            }

            if (value.__type === "BigInt") {
              return BigInt(value.value);
            }
          }

          return value;
        },
      }),
    },
  ),
);
