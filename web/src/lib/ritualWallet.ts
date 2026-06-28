import { parseEther, type PublicClient } from "viem";
import { RITUAL_WALLET, ritualWalletAbi } from "@/abi/RitualWallet";

/** Funding requirements for the AI inspection (judgeAll) call. The LLM
    precompile escrows ~0.311 RITUAL, locked long enough for the async callback. */
export const MIN_LLM_BALANCE = parseEther("0.32");
export const LOCK_DURATION = 100_000n;
export const REQUIRED_TTL_BUFFER = 300n;
export const DEPOSIT_AMOUNT = parseEther("0.4");

export type RitualWalletStatus = {
  balance: bigint;
  lockUntil: bigint;
  currentBlock: bigint;
  hasEnoughBalance: boolean;
  hasEnoughLockDuration: boolean;
  lockExpired: boolean;
  ready: boolean;
};

export async function getRitualWalletStatus({
  publicClient,
  user,
}: {
  publicClient: PublicClient;
  user: `0x${string}`;
}): Promise<RitualWalletStatus> {
  const [balance, lockUntil, currentBlock] = await Promise.all([
    publicClient.readContract({ address: RITUAL_WALLET, abi: ritualWalletAbi, functionName: "balanceOf", args: [user] }),
    publicClient.readContract({ address: RITUAL_WALLET, abi: ritualWalletAbi, functionName: "lockUntil", args: [user] }),
    publicClient.getBlockNumber(),
  ]);
  return deriveStatus(balance, lockUntil, currentBlock);
}

export function deriveStatus(balance: bigint, lockUntil: bigint, currentBlock: bigint): RitualWalletStatus {
  const hasEnoughBalance = balance >= MIN_LLM_BALANCE;
  const hasEnoughLockDuration = lockUntil >= currentBlock + REQUIRED_TTL_BUFFER;
  const lockExpired = lockUntil <= currentBlock;
  return {
    balance,
    lockUntil,
    currentBlock,
    hasEnoughBalance,
    hasEnoughLockDuration,
    lockExpired,
    ready: hasEnoughBalance && hasEnoughLockDuration,
  };
}
