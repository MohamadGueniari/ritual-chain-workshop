import type { StageId } from "@/types";

export interface StageMeta {
  id: StageId;
  index: number;
  /** Short checkpoint name. */
  name: string;
  /** One-line label shown on the checkpoint plate. */
  label: string;
}

/** The 10-checkpoint cargo route:
    private answer → sealed container → barcode → customs reveal → batch
    inspection → AI recommendation → human release → reward paid. */
export const STAGES: StageMeta[] = [
  { id: "dock", index: 0, name: "Wallet Dock", label: "Dock your wallet" },
  { id: "manifest", index: 1, name: "Bounty Manifest", label: "Create the manifest" },
  { id: "phase", index: 2, name: "Phase Control", label: "Watch the phase board" },
  { id: "seal", index: 3, name: "Seal Cargo", label: "Seal your answer" },
  { id: "reveal", index: 4, name: "Customs Reveal", label: "Open at customs" },
  { id: "fuel", index: 5, name: "Fuel Inspection", label: "Power the machine" },
  { id: "inspection", index: 6, name: "Batch Inspection", label: "Inspect all cargo" },
  { id: "report", index: 7, name: "AI Report", label: "Read the report" },
  { id: "release", index: 8, name: "Release Winner", label: "Sign the release" },
  { id: "registry", index: 9, name: "Cargo Registry", label: "Every container" },
];

export const STAGE_BY_ID: Record<StageId, StageMeta> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
) as Record<StageId, StageMeta>;

import type { Bounty, UserRole } from "@/types";

/** Live phase derived from ms deadlines + stored phase (mirrors the contract). */
export function livePhase(b: Bounty, nowMs: number): Bounty["phase"] {
  if (b.phase === "finalized") return "finalized";
  if (b.phase === "judged") return "judged";
  if (nowMs < b.submissionDeadline) return "commit";
  if (nowMs < b.revealDeadline) return "reveal";
  return "judging";
}

/** Which checkpoints the user can open right now, given bounty, role and time. */
export function availableStages(bounty: Bounty | null, role: UserRole, nowMs: number): Set<StageId> {
  const open = new Set<StageId>(["dock"]);
  if (!bounty) {
    open.add("manifest");
    return open;
  }
  const phase = livePhase(bounty, nowMs);
  const isOwner = role === "owner";

  open.add("phase");
  open.add("registry");

  if (phase === "commit") open.add("seal");
  if (phase === "reveal") open.add("reveal");
  if (phase === "judging" && isOwner) {
    open.add("fuel");
    open.add("inspection");
  }
  if (phase === "judged" || phase === "finalized") open.add("report");
  if (phase === "judged" && isOwner) open.add("release");

  return open;
}

/** The checkpoint to auto-advance to when a phase boundary is crossed. */
export function autoStageFor(bounty: Bounty | null, role: UserRole): StageId | null {
  if (!bounty) return null;
  const phase = livePhase(bounty, Date.now());
  const isOwner = role === "owner";
  switch (phase) {
    case "commit":
      return "seal";
    case "reveal":
      return "reveal";
    case "judging":
      return isOwner ? "fuel" : "phase";
    case "judged":
      return "report";
    case "finalized":
      return "registry";
    default:
      return null;
  }
}
