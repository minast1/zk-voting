import { NextResponse } from "next/server";
import { Fr } from "@aztec/bb.js";
import { poseidon2 } from "poseidon-lite";
import { toHex } from "viem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Generate field elements using Fr (server-safe)
    const nullifierFr = BigInt(Fr.random().toString());
    const secretFr = BigInt(Fr.random().toString());

    // Poseidon hashes (must match Noir)
    const commitmentFr = poseidon2([nullifierFr, secretFr]);

    const nullifier = toHex(nullifierFr, { size: 32 });
    const secret = toHex(secretFr, { size: 32 });
    const commitment = toHex(commitmentFr, { size: 32 });

    //  const nullifierHash = poseidon2([nullifier]);

    return NextResponse.json({
      commitment,
      nullifier,
      secret,
      //nullifierHash: toHex(nullifierHash, { size: 32 }),
    });
  } catch (err: any) {
    console.error("Commitment generation failed:", err);
    return NextResponse.json({ error: "Failed to generate commitment" }, { status: 500 });
  }
}
