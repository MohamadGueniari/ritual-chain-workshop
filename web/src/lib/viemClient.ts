import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";
import { ritualChain } from "@/config/chain";
import { ritualRpcUrl } from "@/config/contract";

/* ============================================================================
   viem clients — public (read) via RPC, wallet (write) via window.ethereum.
   No wagmi; the app talks to a single service that owns these clients.
   ========================================================================== */

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getProvider(): Eip1193Provider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found. Install MetaMask or another injected wallet.");
  }
  return window.ethereum;
}

export const publicClient: PublicClient = createPublicClient({
  chain: ritualChain,
  transport: http(ritualRpcUrl),
});

let _walletClient: WalletClient | null = null;

export function getWalletClient(): WalletClient {
  if (_walletClient) return _walletClient;
  _walletClient = createWalletClient({ chain: ritualChain, transport: custom(getProvider()) });
  return _walletClient;
}

export async function ensureRitualNetwork(): Promise<void> {
  const provider = getProvider();
  const hexId = `0x${ritualChain.id.toString(16)}`;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
  } catch (err) {
    if ((err as { code?: number }).code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexId,
            chainName: ritualChain.name,
            nativeCurrency: ritualChain.nativeCurrency,
            rpcUrls: [ritualRpcUrl],
            blockExplorerUrls: [ritualChain.blockExplorers!.default.url],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export async function requestAccounts(): Promise<Address[]> {
  return (await getProvider().request({ method: "eth_requestAccounts" })) as Address[];
}

export async function getChainId(): Promise<number> {
  const hex = (await getProvider().request({ method: "eth_chainId" })) as string;
  return Number(hex);
}
