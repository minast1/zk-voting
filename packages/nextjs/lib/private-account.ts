import { createPublicClient, createTestClient, createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

const privateKey = generatePrivateKey();
export const privateAccount = privateKeyToAccount(privateKey);

export const publicClient: ReturnType<typeof createPublicClient> = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export const testClient = createTestClient({
  chain: hardhat,
  mode: "hardhat",
  transport: http(),
});

export const voterClient = createWalletClient({
  chain: hardhat,
  account: privateAccount,
  transport: http(),
});
