import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Boxes } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InspectionMachine, OpenContainer, SealedContainer } from "@/components/cargo/CargoGlyphs";
import { SafetyConfirmDialog } from "@/components/modals/SafetyConfirmDialog";
import { useRitualWallet } from "@/hooks/useRitualWallet";

const STEPS = [
  "Collecting verified cargo",
  "Excluding sealed containers",
  "Building batch inspection payload",
  "Applying rubric",
  "Generating AI recommendation",
  "Printing report",
];

/** Stage 6 — Batch Inspection. All eligible containers enter ONE tunnel together. */
export function InspectionStage() {
  const { submissions, judgeAll, busy } = useCargoStore();
  const { status: walletStatus } = useRitualWallet();
  const funded = walletStatus?.ready === true;
  const [confirm, setConfirm] = useState(false);
  const [step, setStep] = useState(-1);

  const eligible = submissions.filter((s) => s.eligible);
  const excluded = submissions.filter((s) => !s.eligible);

  useEffect(() => {
    if (!busy) {
      setStep(-1);
      return;
    }
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 280);
    return () => clearInterval(t);
  }, [busy]);

  async function run() {
    setConfirm(false);
    await judgeAll();
  }

  return (
    <StageScaffold
      tag="Checkpoint 06"
      title="Batch Inspection"
      intro="All verified reveals are inspected together. No one-by-one judging. AI recommends. Owner releases."
      accent="var(--color-ai)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="panel relative overflow-hidden rounded-lg p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--color-paper)]/45">Inspection tunnel</span>
            <Badge color="var(--color-teal)">{eligible.length} eligible</Badge>
          </div>

          {/* tunnel with eligible containers */}
          <div className="relative rounded-md border border-[var(--color-ai)]/25 bg-black/30 p-4">
            {busy && (
              <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-ai) 35%, transparent), transparent)" }} />
            )}
            <div className="relative flex flex-wrap gap-3">
              {eligible.map((s) => (
                <motion.div key={s.index} layout className="flex flex-col items-center gap-1">
                  <OpenContainer size={86} />
                  <span className="font-mono text-[11px] text-[var(--color-paper)]/50">#{s.index}</span>
                </motion.div>
              ))}
              {eligible.length === 0 && <p className="text-[14px] text-[var(--color-paper)]/55">No verified cargo — nothing to inspect yet.</p>}
            </div>
          </div>

          {excluded.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/40">Diverted — sealed / unrevealed</div>
              <div className="flex flex-wrap gap-3 opacity-40">
                {excluded.map((s) => (
                  <div key={s.index} className="flex flex-col items-center gap-1">
                    <SealedContainer size={64} />
                    <span className="font-mono text-[10px] text-[var(--color-paper)]/45">#{s.index}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="panel flex flex-col items-center gap-4 rounded-lg p-5">
          <InspectionMachine size={220} power={1} scanning={busy} />
          {busy ? (
            <div className="w-full space-y-1.5">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-[13px]" style={{ color: i <= step ? "var(--color-ai)" : "rgba(243,237,225,0.35)" }}>
                  <span className="grid h-4 w-4 place-items-center">
                    {i < step ? "✓" : i === step ? <span className="h-2 w-2 rounded-full bg-[var(--color-ai)] bc-pulse" style={{ color: "var(--color-ai)" }} /> : "·"}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-center text-[14px] font-medium text-[var(--color-paper)]/65">
                The machine is powered and ready to inspect every container at once.
              </p>
              <Button variant="ai" size="lg" className="w-full" disabled={eligible.length === 0 || !funded} onClick={() => setConfirm(true)}>
                <Boxes size={17} /> Judge all (batch)
              </Button>
              {!funded && <p className="text-center text-[13px] text-[var(--color-owner)]">Power the machine first (Checkpoint 05).</p>}
            </>
          )}
        </div>
      </div>

      <SafetyConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Run batch inspection?"
        description="The Ritual AI inspects every verified container together in a single batch against the rubric, then recommends a winner."
        accent="var(--color-ai)"
        confirmVariant="ai"
        confirmLabel="Run inspection"
        busy={busy}
        onConfirm={run}
        checklist={[
          `${eligible.length} verified containers inspected together.`,
          "Sealed / unrevealed containers are excluded.",
          "On Ritual this pins gas: 6,000,000 for the async LLM replay.",
          "The AI only recommends — you release the winner.",
        ]}
      />
    </StageScaffold>
  );
}
