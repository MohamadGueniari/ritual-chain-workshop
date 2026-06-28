import { useEffect, useState } from "react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { MechanicalCountdown } from "@/components/cargo/MechanicalCountdown";
import { shortAddress, formatReward } from "@/lib/utils";
import { livePhase } from "@/lib/stages";
import type { BountyPhase } from "@/types";

const PHASES: { id: BountyPhase; label: string; copy: string; color: string }[] = [
  { id: "commit", label: "Commit", copy: "Commit phase: cargo is sealed.", color: "var(--color-sealed)" },
  { id: "reveal", label: "Reveal", copy: "Reveal phase: containers can be opened.", color: "var(--color-teal)" },
  { id: "judging", label: "Judging", copy: "Judging phase: AI inspects all valid reveals together.", color: "var(--color-ai)" },
  { id: "judged", label: "Judged", copy: "AI report printed — awaiting human release.", color: "var(--color-ai)" },
  { id: "finalized", label: "Finalized", copy: "Finalized: winner released and paid.", color: "var(--color-bullion)" },
];

/** Stage 2 — Phase Control. Industrial phase board + mechanical countdowns. */
export function PhaseStage() {
  const { bounty, submissions } = useCargoStore();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!bounty) return null;
  const phase = livePhase(bounty, now);
  const current = PHASES.find((p) => p.id === phase)!;
  const revealed = submissions.filter((s) => s.eligible).length;

  return (
    <StageScaffold tag="Checkpoint 02" title="Phase Control" intro={current.copy} accent={current.color}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* phase board */}
          <div className="panel grid grid-cols-5 gap-1.5 rounded-lg p-3">
            {PHASES.map((p) => {
              const active = p.id === phase;
              return (
                <div
                  key={p.id}
                  className="rounded-sm border p-2 text-center transition-colors"
                  style={{
                    borderColor: active ? `color-mix(in srgb, ${p.color} 60%, transparent)` : "rgba(207,199,184,0.12)",
                    background: active ? `color-mix(in srgb, ${p.color} 14%, transparent)` : "transparent",
                  }}
                >
                  <div className={`mx-auto mb-1 h-2 w-2 rounded-full ${active ? "bc-pulse" : ""}`} style={{ background: active ? p.color : "rgba(207,199,184,0.3)", color: p.color }} />
                  <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: active ? p.color : "var(--color-paper)/50" }}>
                    {p.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Reward locked" value={formatReward(bounty.reward, bounty.rewardSymbol)} color="var(--color-bullion)" />
            <Stat label="Owner" value={shortAddress(bounty.owner)} />
            <Stat label="Sealed cargo" value={String(submissions.length)} color="var(--color-safety)" />
            <Stat label="Verified reveals" value={String(revealed)} color="var(--color-teal)" />
          </div>

          <div className="panel rounded-lg p-4">
            <div className="text-[13px] font-bold uppercase tracking-wide text-[var(--color-paper)]/55">Inspection rules</div>
            <p className="mt-1 text-[15px] leading-relaxed text-[var(--color-paper)]/70">{bounty.rubric}</p>
          </div>
        </div>

        <div className="panel flex flex-col gap-5 rounded-lg p-5">
          <div className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--color-paper)]/45">Countdowns</div>
          <MechanicalCountdown label="Loading cutoff" deadlineMs={bounty.submissionDeadline} />
          <MechanicalCountdown label="Customs cutoff" deadlineMs={bounty.revealDeadline} startMs={bounty.submissionDeadline} />
          <p className="text-[13px] leading-snug text-[var(--color-paper)]/50">
            When a timer ends, a heavy gate closes and the next phase unlocks.
          </p>
        </div>
      </div>
    </StageScaffold>
  );
}

function Stat({ label, value, color = "var(--color-paper)" }: { label: string; value: string; color?: string }) {
  return (
    <div className="panel rounded-md p-4">
      <div className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/45">{label}</div>
      <div className="mt-1 text-[18px] font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
