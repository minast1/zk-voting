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

// Type guard to verify the format during rehydration
function isSerializedUint8Array(value: any): value is SerializedUint8Array {
  return value !== null && typeof value === "object" && value.__type === "Uint8Array" && Array.isArray(value.data);
}

type ChallengeStoreType = {
  commitmentData: CommitmentData | null;
  setCommitmentData: (data: CommitmentData | null) => void;
  proofData: ProofData | null;
  setProofData: (data: ProofData | null) => void;
  voteChoice: boolean | null;
  setVoteChoice: (choice: boolean | null) => void;
  updateCommitmentIndex: (index: number) => void;
  reset: () => void;
};

const PROOF_STORAGE_KEY_PREFIX = "zk-voting-proof-data";
const initialState = {
  commitmentData: null,
  proofData: null,
  voteChoice: null,
};
export const useChallengeStore = create<ChallengeStoreType>()(
  persist(
    set => ({
      ...initialState,
      //updaters
      setCommitmentData: data => set({ commitmentData: data }),
      setProofData: data => set({ proofData: data }),
      setVoteChoice: choice => set({ voteChoice: choice }),
      updateCommitmentIndex: index =>
        set(state => ({
          commitmentData: state.commitmentData ? { ...state.commitmentData, index } : state.commitmentData,
        })),
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: PROOF_STORAGE_KEY_PREFIX,
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
          return value;
        },
        // Recursively reconstructs Uint8Array during rehydration
        reviver: (key, value) => {
          if (isSerializedUint8Array(value)) {
            return new Uint8Array(value.data);
          }
          return value;
        },
      }),
    },
  ),
);
