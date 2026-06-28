import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Plug,
  FileText,
  GaugeCircle,
  Lock,
  ScanLine,
  Fuel,
  Boxes,
  ClipboardCheck,
  PackageCheck,
  Container,
  Check,
  AlertTriangle,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { STAGES, availableStages } from "@/lib/stages";
import type { StageId, StageStatus } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<StageId, LucideIcon> = {
  dock: Plug,
  manifest: FileText,
  phase: GaugeCircle,
  seal: Lock,
  reveal: ScanLine,
  fuel: Fuel,
  inspection: Boxes,
  report: ClipboardCheck,
  release: PackageCheck,
  registry: Container,
};

const STATUS_COLOR: Record<StageStatus, string> = {
  locked: "var(--color-concrete)",
  active: "var(--color-safety)",
  done: "var(--color-teal)",
  warning: "var(--color-safety)",
  error: "var(--color-alarm)",
};

/** Left vertical cargo route — 10 checkpoint plates; the active one slides out. */
export function CargoRouteRail() {
  const { activeStage, setStage, bounty, role } = useCargoStore();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const open = availableStages(bounty, role, now);

  function statusOf(stage: (typeof STAGES)[number]): StageStatus {
    if (stage.id === activeStage) return "active";
    if (open.has(stage.id)) return "done";
    return "locked";
  }

  return (
    <nav className="panel rivets flex h-full flex-col gap-2 rounded-lg p-3">
      <div className="mb-1 px-2 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-paper)]/45">
        Cargo Route
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto pr-1 thin-scroll">
        {STAGES.map((stage) => {
          const status = statusOf(stage);
          const Icon = ICONS[stage.id];
          const color = STATUS_COLOR[status];
          const locked = status === "locked";
          const isActive = status === "active";

          return (
            <motion.button
              key={stage.id}
              layout
              disabled={locked}
              onClick={() => !locked && setStage(stage.id)}
              animate={{ x: isActive ? 8 : 0 }}
              whileHover={!locked && !isActive ? { x: 4 } : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-md border p-2.5 text-left transition-colors duration-200",
                locked ? "cursor-not-allowed opacity-45" : "cursor-pointer"
              )}
              style={{
                borderColor: `color-mix(in srgb, ${color} ${isActive ? 60 : 22}%, transparent)`,
                background: isActive
                  ? `color-mix(in srgb, ${color} 12%, rgba(255,255,255,0.02))`
                  : "rgba(255,255,255,0.02)",
                boxShadow: isActive ? `0 0 22px -8px ${color}` : "none",
              }}
            >
              {/* status light */}
              <span
                className={cn("h-2.5 w-2.5 shrink-0 rounded-full", isActive && "bc-pulse")}
                style={{ background: color, color, opacity: status === "locked" ? 0.3 : 1 }}
              />
              {/* plate icon */}
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md"
                style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
              >
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[12px] text-[var(--color-paper)]/40">
                    {String(stage.index).padStart(2, "0")}
                  </span>
                  <span
                    className="truncate text-[14px] font-bold uppercase tracking-wide"
                    style={{ color: isActive ? color : "var(--color-paper)" }}
                  >
                    {stage.name}
                  </span>
                </div>
                {isActive && (
                  <div className="truncate text-[12px] text-[var(--color-paper)]/55">{stage.label}</div>
                )}
              </div>
              <Stamp status={status} color={color} />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

function Stamp({ status, color }: { status: StageStatus; color: string }) {
  if (status === "done")
    return (
      <span className="grid h-5 w-5 place-items-center rounded-sm" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
        <Check size={12} />
      </span>
    );
  if (status === "warning") return <AlertTriangle size={15} style={{ color }} />;
  if (status === "error") return <X size={15} style={{ color }} />;
  return null;
}
