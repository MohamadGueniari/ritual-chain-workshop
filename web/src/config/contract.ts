import type { Address } from "viem";
import cargoAbi from "@/abi/CargoManifestJudge";

/**
 * On-chain config. Read from Vite VITE_* env vars; sensible defaults point at
 * the live CargoManifestJudge deployment on Ritual.
 */

export const manifestAbi = cargoAbi;

const rawAddress = (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined)?.trim();

export const contractAddress: Address =
  rawAddress && /^0x[0-9a-fA-F]{40}$/.test(rawAddress)
    ? (rawAddress as Address)
    : "0x679666151d5C2c329a23f5E23C659C383d5DAf2F";

export const executorAddress: Address =
  ((import.meta.env.VITE_RITUAL_EXECUTOR_ADDRESS as string | undefined)?.trim() as Address | undefined) ??
  "0xB42e435c4252A5a2E7440e37B609F00c61a0c91B";

export const ritualChainId = Number((import.meta.env.VITE_RITUAL_CHAIN_ID as string | undefined) ?? "1979");

export const ritualRpcUrl =
  (import.meta.env.VITE_RITUAL_RPC_URL as string | undefined) ?? "https://rpc.ritualfoundation.org";
