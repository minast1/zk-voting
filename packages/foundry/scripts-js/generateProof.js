import { Noir } from "@aztec/noir-noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";
import { LeanIMT } from "@zk-kit/lean-imt";
import { poseidon2 } from "poseidon-lite";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // 1. Setup
  const hash = (a, b) => poseidon2([a, b]);

  // 2. Parse Inputs from FFI
  const [
    ,
    ,
    poll_id,
    vote,
    index,
    nullifier,
    secret,
    depth,
    root,
    ...ffiSiblings
  ] = process.argv;

  const commitment = poseidon2([BigInt(nullifier), BigInt(secret)]);

  const tree = new LeanIMT(hash);

  const leaves = ffiSiblings.map((a) => BigInt(a));
  tree.insert(leaves);
  const leafIndex = parseInt(index);
  // // 3. Generate LeanIMT Proof (Siblings)
  const merkleProof = tree.generateProof(leafIndex);
  const nullifierHash = poseidon2([nullifier, poll_id]);

  const sibs = merkleProof.siblings.map((sib) => BigInt(sib).toString());
  const lengthDiff = 16 - sibs.length;
  for (let i = 0; i < lengthDiff; i++) {
    sibs.push("0");
  }

  // 4. Load Noir Circuit
  const circuitPath = path.resolve(
    process.cwd(),
    "../circuits/target/circuits.json",
  );
  const circuitFile = fs.readFileSync(circuitPath, "utf-8");
  const parsedCiruit = JSON.parse(circuitFile);

  const noir = new Noir(parsedCiruit);

  const backend = new UltraHonkBackend(parsedCiruit.bytecode, { threads: 1 });

  const input = {
    null_hash: nullifierHash.toString(),
    root: root.toString(),
    vote: vote === "true",
    depth: merkleProof.siblings.length,
    poll_id: poll_id.toString(),
    nullifier: nullifier,
    secret: secret,
    index: parseInt(index),
    siblings: sibs, //paddedSiblings,
  };
  // 5. Generate ZK Proof
  const { witness } = await noir.execute(input);

  const { proof } = await backend.generateProof(witness, { keccak: true });

  const toBytes32 = (value) =>
    ethers.utils.hexZeroPad(ethers.BigNumber.from(value).toHexString(), 32);
  // 6. ABI Encode for Foundry
  const abiCoder = ethers.utils.defaultAbiCoder;
  const result = abiCoder.encode(
    ["bytes", "bytes32"],
    [
      proof,
      toBytes32(nullifierHash), // Convert decimal BigInt to 32-byte he
    ],
  );
  process.stdout.write(result);
  //return result;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
