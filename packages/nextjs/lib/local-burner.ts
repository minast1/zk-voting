import { privateAccount } from "./private-account";
import uint8ArrayToHexString from "./uint-to-hex";
import { createWalletClient, http, parseEther, publicActions, walletActions } from "viem";
import { ProofData } from "~~/services/store/zk-store";

type TProps = {
  proofData: ProofData;
  pollId: number;
  contractInfo: any;
  publicClient: any;
  mainWalletClient: any;
};
export async function invokeLocalBurner({ proofData, pollId, contractInfo, publicClient, mainWalletClient }: TProps) {
  // const network = scaffoldConfig.targetNetworks[0];
  const burnerAccount = privateAccount;
  const burnerClient = createWalletClient({
    account: burnerAccount,
    chain: publicClient.chain,
    transport: http(),
  }).extend(publicActions);

  const client = mainWalletClient.extend(walletActions);
  try {
    const balance = await publicClient.getBalance({
      address: burnerAccount.address as `0x${string}`,
    });

    if (balance < parseEther("0.2")) {
      const fundTx = await client.sendTransaction({
        to: burnerAccount.address as `0x${string}`,
        value: parseEther("0.2"),
      });

      if (!fundTx) throw new Error("Failed to fund burner account");
      await publicClient.waitForTransactionReceipt({ hash: fundTx.hash });
    }

    const hash = await burnerClient.writeContract({
      chain: publicClient.chain,
      address: contractInfo.address as `0x${string}`,
      abi: contractInfo.abi,
      functionName: "vote",
      args: [
        BigInt(pollId),
        uint8ArrayToHexString(proofData.proof),
        proofData.publicInputs[0],
        proofData.publicInputs[1],
        proofData.publicInputs[2],
        proofData.publicInputs[3],
      ],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error) {
    console.error("Anonymous voting failed:", error);
    throw error;
  }
}
