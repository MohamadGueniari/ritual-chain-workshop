import { motion } from "framer-motion";
import { Plug, AlertTriangle } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";

/** Stage 0 — Wallet Dock. Closed gate opens on connect; status light turns on. */
export function DockStage() {
  const { network, connect, busy } = useCargoStore();
  const docked = network === "connected";
  const wrong = network === "wrong-network";

  return (
    <StageScaffold
      tag="Checkpoint 00"
      title="Wallet Dock"
      intro="Connect your wallet to enter the cargo route. Ritual network required."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="panel relative grid h-[300px] place-items-center overflow-hidden rounded-lg">
          {/* gate doors */}
          <motion.div
            className="absolute left-0 top-0 h-full w-1/2 hazard"
            animate={{ x: docked ? "-100%" : "0%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          <motion.div
            className="absolute right-0 top-0 h-full w-1/2 hazard"
            animate={{ x: docked ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          {/* status light */}
          <div className="relative z-[1] flex flex-col items-center gap-3">
            <span
              className={`h-16 w-16 rounded-full border-4 ${docked ? "bc-pulse" : ""}`}
              style={{
                borderColor: docked ? "var(--color-teal)" : "var(--color-sealed)",
                background: docked ? "var(--color-teal)" : "transparent",
                color: "var(--color-teal)",
                opacity: docked ? 1 : 0.4,
              }}
            />
            <span className="text-[14px] font-bold uppercase tracking-widest text-[var(--color-paper)]/70">
              {docked ? "Gate open" : "Gate closed"}
            </span>
          </div>
          {wrong && <div className="absolute inset-x-0 bottom-0 h-3 hazard-alarm bc-blink" />}
        </div>

        <div className="flex flex-col justify-center gap-4">
          {wrong && (
            <div className="panel bc-shake flex items-start gap-2.5 rounded-md border-[var(--color-alarm)]/45 p-3.5">
              <AlertTriangle size={18} className="mt-0.5 text-[var(--color-alarm)]" />
              <p className="text-[14px] text-[var(--color-paper)]/85">
                Wrong network. Switch your wallet to <b>Ritual</b> to dock.
              </p>
            </div>
          )}
          <p className="text-[16px] leading-relaxed text-[var(--color-paper)]/75">
            {docked ? "Wallet docked. The route is open — create a bounty manifest to begin." : "The dock gate is sealed. Your wallet is the access badge that opens it."}
          </p>
          {!docked && (
            <Button variant="safety" size="lg" onClick={connect} disabled={busy} className="self-start">
              <Plug size={18} /> {busy ? "Docking…" : "Connect wallet"}
            </Button>
          )}
        </div>
      </div>
    </StageScaffold>
  );
}
