import { privateAccount } from "./private-account";
import uint8ArrayToHexString from "./uint-to-hex";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { sepolia } from "viem/chains";
import { ProofData } from "~~/services/store/zk-store";

const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;

type TProps = {
  proofData: ProofData;
  pollId: number;
  contractInfo: any;
};
export async function invokeSepoliaBurner({ proofData, pollId, contractInfo }: TProps) {
  try {
    if (!apiKey) throw new Error("Missing PIMLICO_API_KEY");

    const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`;
    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });
    const pimlicoClient = createPimlicoClient({
      chain: sepolia,
      transport: http(pimlicoUrl),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    });

    const account = await toSafeSmartAccount({
      client: publicClient,
      owners: [privateAccount],
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
      version: "1.4.1",
    });
    //smart account address = account.address
    const smartAccountClient = createSmartAccountClient({
      account,
      chain: sepolia,
      bundlerTransport: http(pimlicoUrl),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    });
    const callData = encodeFunctionData({
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

    const txHash = await smartAccountClient.sendTransaction({
      to: contractInfo.address as `0x${string}`,
      data: callData,
      value: BigInt(0),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    return receipt;
  } catch (error) {
    console.log("Error registering commitment:", error);
  }
}
