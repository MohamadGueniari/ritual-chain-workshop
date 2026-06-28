import { keccak256, encodeAbiParameters, parseAbiParameters, type Hex } from "viem";

/* ============================================================================
   Commit-reveal cryptography.
   The commitment binds answer + salt + sender + bountyId, matching the on-chain
   check a Ritual bounty contract would perform on reveal.
   ========================================================================== */

/** Random 32-byte salt as 0x-hex — the private customs key. */
export function generateSalt(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return ("0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")) as Hex;
}

/** keccak256(abi.encode(answer, salt, sender, bountyId)) — the barcode hash. */
export function computeCommitment(
  answer: string,
  salt: Hex,
  sender: `0x${string}`,
  bountyId: bigint
): Hex {
  const encoded = encodeAbiParameters(
    parseAbiParameters("string, bytes32, address, uint256"),
    [answer, salt, sender, bountyId]
  );
  return keccak256(encoded);
}

export function verifyReveal(
  answer: string,
  salt: Hex,
  sender: `0x${string}`,
  bountyId: bigint,
  original: Hex
): boolean {
  return (
    computeCommitment(answer, salt, sender, bountyId).toLowerCase() ===
    original.toLowerCase()
  );
}
