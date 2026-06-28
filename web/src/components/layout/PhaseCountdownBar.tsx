import { useEffect, useState } from "react";
import { Clock, Lock, ScanLine, Boxes, PackageCheck } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { livePhase } from "@/lib/stages";
import { formatCountdown, urgencyOf, type Urgency } from "@/lib/utils";
import type { Bounty } from "@/types";

const URGENCY_COLOR: Record<Urgency, string> = {
  ok: "var(--color-teal)",
  warning: "var(--color-safety)",
  critical: "var(--color-alarm)",
};

/** Always-visible phase bar: where the manifest is + live countdowns to the next
    gate (loading close → customs close → batch inspection). */
export function PhaseCountdownBar() {
  const bounty = useCargoStore((s) => s.bounty);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!bounty) return null;

  const phase = livePhase(bounty, now);

  return (
    <div className="panel flex w-full flex-wrap items-center gap-x-5 gap-y-2 rounded-lg px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-[var(--color-teal)]" />
        <span className="text-[12px] font-black uppercase tracking-[0.18em] text-[var(--color-paper)]/45">
          Manifest #{bounty.id.toString()}
        </span>
      </div>
      <CountItem icon={<Lock size={15} />} label="Loading closes" target={bounty.submissionDeadline} now={now} active={phase === "commit"} passed="Loading closed" />
      <CountItem icon={<ScanLine size={15} />} label="Customs closes" target={bounty.revealDeadline} now={now} active={phase === "reveal"} passed="Customs closed" />
      <PhasePill phase={phase} />
    </div>
  );
}

function CountItem({
  icon, label, target, now, active, passed,
}: {
  icon: React.ReactNode; label: string; target: number; now: number; active: boolean; passed: string;
}) {
  const ended = now >= target;
  const color = ended ? "var(--color-concrete)" : URGENCY_COLOR[urgencyOf(target, now)];
  return (
    <div className="flex items-center gap-2">
      <span style={{ color }} className={active && !ended ? "bc-pulse" : ""}>{icon}</span>
      <div className="leading-tight">
        <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-paper)]/45">{ended ? passed : label}</div>
        <div className="font-mono text-[16px] font-bold" style={{ color }}>{ended ? "—" : formatCountdown(target, now)}</div>
      </div>
    </div>
  );
}

function PhasePill({ phase }: { phase: Bounty["phase"] }) {
  const map: Record<Bounty["phase"], { label: string; color: string; icon: React.ReactNode }> = {
    commit: { label: "Loading (Commit)", color: "var(--color-sealed)", icon: <Lock size={14} /> },
    reveal: { label: "Customs (Reveal)", color: "var(--color-teal)", icon: <ScanLine size={14} /> },
    judging: { label: "Ready to inspect", color: "var(--color-ai)", icon: <Boxes size={14} /> },
    judged: { label: "Awaiting release", color: "var(--color-ai)", icon: <Boxes size={14} /> },
    finalized: { label: "Released", color: "var(--color-bullion)", icon: <PackageCheck size={14} /> },
  };
  const m = map[phase];
  return (
    <div
      className="ml-auto flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[13px] font-bold uppercase tracking-wide"
      style={{ color: m.color, borderColor: `color-mix(in srgb, ${m.color} 45%, transparent)`, background: `color-mix(in srgb, ${m.color} 12%, transparent)` }}
    >
      {m.icon}
      {m.label}
    </div>
  );
}
