import type { Hex } from "viem";

/* ============================================================================
   Local reveal kit. During Seal Cargo the participant must keep answer + salt
   locally — only the barcode hash goes on-chain. Without the kit they cannot
   pass customs (reveal) later.
   ========================================================================== */

const KEY = "blindcargo:reveal-kit";

export interface RevealKitEntry {
  bountyId: string;
  answer: string;
  salt: Hex;
  commitment: Hex;
  savedAt: number;
}

type KitMap = Record<string, RevealKitEntry>;

function read(): KitMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as KitMap;
  } catch {
    return {};
  }
}

function write(map: KitMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function saveRevealKit(entry: RevealKitEntry) {
  const map = read();
  map[entry.bountyId] = entry;
  write(map);
}

export function loadRevealKit(bountyId: string): RevealKitEntry | null {
  return read()[bountyId] ?? null;
}

export function downloadRevealKit(entry: RevealKitEntry) {
  const blob = new Blob([JSON.stringify(entry, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blind-cargo-reveal-kit-bounty-${entry.bountyId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
