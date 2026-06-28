/* ============================================================================
   Blind Cargo Judge — shared domain types
   Mirror what a real Ritual commit-reveal bounty contract would expose, so the
   Web3 service can drop in behind the same interface later.
   ========================================================================== */

export type UserRole = "owner" | "participant" | "visitor";

export type NetworkStatus = "disconnected" | "wrong-network" | "connected";

/** On-chain bounty lifecycle phase. */
export type BountyPhase = "commit" | "reveal" | "judging" | "judged" | "finalized";

/** The 10 cargo-route checkpoints. */
export type StageId =
  | "dock"
  | "manifest"
  | "phase"
  | "seal"
  | "reveal"
  | "fuel"
  | "inspection"
  | "report"
  | "release"
  | "registry";

export type StageStatus = "locked" | "active" | "done" | "warning" | "error";

export type SubmissionStatus =
  | "sealed" // committed, answer hidden
  | "opened" // valid reveal
  | "rejected" // invalid reveal (hash mismatch)
  | "unrevealed" // never revealed
  | "ai-pick" // recommended by AI
  | "winner"; // finalized winner

export interface Bounty {
  id: bigint;
  title: string;
  rubric: string;
  owner: `0x${string}`;
  reward: number;
  rewardSymbol: string;
  submissionDeadline: number; // ms epoch (Ritual uses ms)
  revealDeadline: number; // ms epoch
  phase: BountyPhase;
  aiFunded: boolean;
  aiFundBalance: number;
  aiFundRequired: number;
}

export interface CommitmentData {
  answer: string;
  salt: `0x${string}`;
  sender: `0x${string}`;
  bountyId: bigint;
  commitment: `0x${string}`;
}

export interface RevealData {
  answer: string;
  salt: `0x${string}`;
  matches: boolean;
}

export interface Submission {
  index: number;
  participant: `0x${string}`;
  commitment: `0x${string}`;
  status: SubmissionStatus;
  revealedAnswer?: string;
  eligible: boolean;
  aiRank?: number;
  aiScore?: number;
}

export interface AIVerdict {
  recommendedIndex: number;
  summary: string;
  ranking: Array<{ index: number; score: number; reason: string }>;
  confidence: "low" | "medium" | "high";
}

export type TimelineEventKind =
  | "wallet"
  | "created"
  | "reward-locked"
  | "sealed"
  | "revealed"
  | "fund"
  | "inspect-start"
  | "report"
  | "released"
  | "paid";

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  label: string;
  detail?: string;
  at: number;
}
