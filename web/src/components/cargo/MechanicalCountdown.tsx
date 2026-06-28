import { useEffect, useState } from "react";
import { countdownParts, urgencyOf, type Urgency } from "@/lib/utils";

const URGENCY_COLOR: Record<Urgency, string> = {
  ok: "var(--color-teal)",
  warning: "var(--color-safety)",
  critical: "var(--color-alarm)",
};

/** Mechanical flip-timer + progress rail. Shakes and reddens near the deadline. */
export function MechanicalCountdown({
  label,
  deadlineMs,
  startMs,
}: {
  label: string;
  deadlineMs: number;
  startMs?: number;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { d, h, m, s, total } = countdownParts(deadlineMs, now);
  const urgency = urgencyOf(deadlineMs, now);
  const color = URGENCY_COLOR[urgency];
  const start = startMs ?? deadlineMs - 60 * 60 * 1000;
  const span = Math.max(1, deadlineMs - start);
  const pct = Math.max(0, Math.min(100, ((deadlineMs - now) / span) * 100));
  const ended = total <= 0;

  const cells = d > 0 ? [pad(d), pad(h), pad(m)] : [pad(h), pad(m), pad(s)];
  const units = d > 0 ? ["DD", "HH", "MM"] : ["HH", "MM", "SS"];

  return (
    <div className={urgency === "critical" && !ended ? "bc-shake" : ""}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-paper)]/55">
          {label}
        </span>
        {ended && (
          <span className="text-[12px] font-black uppercase tracking-widest text-[var(--color-paper)]/50">
            Gate closed
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {cells.map((c, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="grid h-11 w-12 place-items-center rounded-sm border bg-black/55 font-mono text-[22px] font-bold tabular-nums"
              style={{ color: ended ? "var(--color-paper)/50" : color, borderColor: `color-mix(in srgb, ${color} 35%, transparent)` }}
            >
              {ended ? "00" : c}
            </div>
            <span className="mt-1 text-[10px] font-bold tracking-widest text-[var(--color-paper)]/40">
              {units[i]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/50">
        <div
          className="h-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${ended ? 0 : pct}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
