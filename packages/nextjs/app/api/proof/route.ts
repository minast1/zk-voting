import { NextResponse } from "next/server";
import { getCircuitData } from "./getCircuit";
import { UltraHonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import { LeanIMT } from "@zk-kit/lean-imt";
import { poseidon2 } from "poseidon-lite";
import { encodeAbiParameters, toHex } from "viem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { nullifier, secret, root, depth, index, leafEvents, selectedVote, poll_id } = await request.json();
  const nullifierHash = poseidon2([BigInt(nullifier), BigInt(poll_id)]);
  const calculatedTree = new LeanIMT((a: bigint, b: bigint) => poseidon2([a, b]));
  const leaves = leafEvents.map((event: any) => {
    return event?.args.value;
  });
  const leavesReversed = leaves.reverse();
  calculatedTree.insertMany(leavesReversed as bigint[]);
  const calculatedProof = calculatedTree.generateProof(Number(index));
  const sibs = calculatedProof.siblings.map((sib: bigint) => sib.toString());
  const lengthDiff = 16 - sibs.length;
  for (let i = 0; i < lengthDiff; i++) {
    sibs.push("0");
  }
  const input = {
    null_hash: nullifierHash.toString(),
    root: root.toString(),
    vote: selectedVote === "yes" ? true : false,
    depth: String(depth),
    poll_id: BigInt(poll_id).toString(),
    nullifier: BigInt(nullifier).toString(),
    secret: BigInt(secret).toString(),
    index: String(index as number),
    siblings: sibs,
  };
  try {
    const circuitData = await getCircuitData();
    if (!circuitData) {
      return NextResponse.json({ error: "Failed to get circuit data" }, { status: 500 });
    }
    const noir = new Noir(circuitData);
    const { witness } = await noir.execute(input);

    const honk = new UltraHonkBackend(circuitData.bytecode, { threads: 1 });
    const originalLog = console.log;
    console.log = () => {};
    const { proof, publicInputs } = await honk.generateProof(witness, { keccak: true });
    console.log = originalLog;
    // console.log({ proof });
    const proofHex = toHex(proof);
    const inputsHex = publicInputs.map(x =>
      typeof x === "string" ? (x as `0x${string}`) : toHex(x as Uint8Array, { size: 32 }),
    );
    encodeAbiParameters([{ type: "bytes" }, { type: "bytes32[]" }], [proofHex, inputsHex]);

    return NextResponse.json({ proof, publicInputs });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to generate proof" }, { status: 500 });
  }
}
