import { defineChain } from "viem";
import { ritualChainId, ritualRpcUrl } from "@/config/contract";

/** Custom Ritual Chain definition. */
export const ritualChain = defineChain({
  id: ritualChainId,
  name: "Ritual Chain",
  nativeCurrency: { name: "Ritual", symbol: "RITUAL", decimals: 18 },
  rpcUrls: { default: { http: [ritualRpcUrl] } },
  blockExplorers: {
    default: { name: "RitualScan", url: "https://explorer.ritualfoundation.org" },
  },
});
