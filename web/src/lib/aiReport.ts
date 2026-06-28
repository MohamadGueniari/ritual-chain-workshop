import { hexToString } from "viem";

export type RankingEntry = { index: number; score: number; reason: string };
export type JudgeResult = { winnerIndex: number; ranking: RankingEntry[]; summary: string };

const EMPTY_BYTES = new Set(["", "0x"]);

/** Decode the on-chain `aiReport` bytes into a parsed verdict, when possible. */
export function decodeAiReport(hex?: string): JudgeResult | null {
  if (!hex || EMPTY_BYTES.has(hex)) return null;
  let raw: string;
  try {
    raw = hexToString(hex as `0x${string}`);
  } catch {
    raw = hex;
  }
  return tryParse(raw);
}

function tryParse(text: string): JudgeResult | null {
  const candidate = extractJson(text);
  if (!candidate) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(candidate);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.winnerIndex !== "number") return null;
  const ranking: RankingEntry[] = Array.isArray(o.ranking)
    ? (o.ranking as unknown[])
        .map((r) => {
          if (!r || typeof r !== "object") return null;
          const e = r as Record<string, unknown>;
          return {
            index: typeof e.index === "number" ? e.index : Number(e.index),
            score: typeof e.score === "number" ? e.score : Number(e.score),
            reason: typeof e.reason === "string" ? e.reason : String(e.reason ?? ""),
          } satisfies RankingEntry;
        })
        .filter((r): r is RankingEntry => r !== null)
    : [];
  return {
    winnerIndex: o.winnerIndex,
    ranking,
    summary: typeof o.summary === "string" ? o.summary : "",
  };
}

function extractJson(text: string): string | null {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return t.slice(start, end + 1);
}
