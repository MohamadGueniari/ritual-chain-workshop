import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(addr?: string | null): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function shortHash(hash?: string | null, lead = 10, tail = 8): string {
  if (!hash) return "—";
  if (hash.length <= lead + tail + 1) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

/** Ritual's block.timestamp is in MILLISECONDS, so all deadlines stay in ms. */
export function countdownParts(targetMs: number, nowMs: number) {
  const total = Math.max(0, targetMs - nowMs);
  const s = Math.floor(total / 1000) % 60;
  const m = Math.floor(total / 60000) % 60;
  const h = Math.floor(total / 3600000) % 24;
  const d = Math.floor(total / 86400000);
  return { d, h, m, s, total };
}

export function formatCountdown(targetMs: number, nowMs: number): string {
  const { d, h, m, s, total } = countdownParts(targetMs, nowMs);
  if (total <= 0) return "closed";
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export type Urgency = "ok" | "warning" | "critical";

export function urgencyOf(targetMs: number, nowMs: number): Urgency {
  const remaining = targetMs - nowMs;
  if (remaining <= 0) return "critical";
  if (remaining < 2 * 60 * 1000) return "critical";
  if (remaining < 10 * 60 * 1000) return "warning";
  return "ok";
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function formatReward(amount: number, symbol = "RITUAL"): string {
  return `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)} ${symbol}`;
}
