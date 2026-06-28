import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCargoStore } from "@/store/useCargoStore";
import type { TimelineEvent, TimelineEventKind } from "@/types";

const KIND_COLOR: Record<TimelineEventKind, string> = {
  wallet: "var(--color-teal)",
  created: "var(--color-owner)",
  "reward-locked": "var(--color-bullion)",
  sealed: "var(--color-sealed)",
  revealed: "var(--color-teal)",
  fund: "var(--color-owner)",
  "inspect-start": "var(--color-ai)",
  report: "var(--color-ai)",
  released: "var(--color-bullion)",
  paid: "var(--color-bullion)",
};

/** Bottom conveyor belt — recent events ride little crates left to right. */
export function ConveyorEventLog() {
  const { timeline } = useCargoStore();
  const [open, setOpen] = useState<TimelineEvent | null>(null);

  return (
    <div className="panel rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-paper)]/45">
          Conveyor Log
        </span>

        {/* the belt */}
        <div className="relative flex-1 overflow-hidden rounded-sm">
          <div
            className="pointer-events-none absolute inset-0 bc-conveyor opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(207,199,184,0.18) 0 2px, transparent 2px 24px)",
              backgroundSize: "48px 100%",
            }}
          />
          {timeline.length === 0 ? (
            <span className="block py-1.5 text-[13px] text-[var(--color-paper)]/45">
              Belt idle — dock a wallet to start the line.
            </span>
          ) : (
            <div className="relative flex items-center gap-2 overflow-x-auto py-1 thin-scroll">
              {timeline.map((e, i) => {
                const color = KIND_COLOR[e.kind];
                const last = i === timeline.length - 1;
                return (
                  <button
                    key={e.id}
                    onClick={() => setOpen(e)}
                    title={e.detail ? `${e.label} — ${e.detail}` : e.label}
                    className="flex shrink-0 items-center gap-1.5 rounded-sm border bg-black/40 px-2 py-1 transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: `color-mix(in srgb, ${color} 35%, transparent)` }}
                  >
                    <span
                      className={`h-2 w-2 rounded-[1px] ${last ? "bc-pulse" : ""}`}
                      style={{ background: color, color }}
                    />
                    <span className="whitespace-nowrap text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/80">
                      {e.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center justify-between rounded-sm border border-[var(--color-concrete)]/15 bg-black/30 px-3 py-2">
              <div>
                <div className="text-[14px] font-bold text-[var(--color-paper)]">{open.label}</div>
                {open.detail && <div className="text-[13px] text-[var(--color-paper)]/60">{open.detail}</div>}
                <div className="font-mono text-[12px] text-[var(--color-paper)]/40">
                  {new Date(open.at).toLocaleTimeString()}
                </div>
              </div>
              <button onClick={() => setOpen(null)} className="text-[13px] uppercase tracking-wide text-[var(--color-paper)]/55 hover:text-[var(--color-paper)]">
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
