import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PackageCheck, Crown, Cpu, PenLine } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OpenContainer, RewardVault } from "@/components/cargo/CargoGlyphs";
import { SafetyConfirmDialog } from "@/components/modals/SafetyConfirmDialog";
import { useToast } from "@/components/feedback/Toaster";
import { shortAddress, formatReward } from "@/lib/utils";

/** Stage 8 — Release Winner. Owner signs the manifest; the vault opens and pays. */
export function ReleaseStage() {
  const { bounty, submissions, verdict, selectedWinner, selectWinner, finalizeWinner, busy } = useCargoStore();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  if (!bounty) return null;

  const eligible = submissions.filter((s) => s.eligible);
  const chosen = selectedWinner ?? verdict?.recommendedIndex ?? eligible[0]?.index ?? 0;
  const override = verdict ? chosen !== verdict.recommendedIndex : false;
  const finalized = bounty.phase === "finalized";

  async function release() {
    await finalizeWinner(chosen);
    setConfirm(false);
    toast("success", `Released — ${formatReward(bounty!.reward, bounty!.rewardSymbol)} paid.`);
  }

  return (
    <StageScaffold
      tag="Checkpoint 08"
      title="Release Winner"
      intro="Owner confirms the winner. AI recommends. Human releases. Sign the manifest to pay."
      accent="var(--color-bullion)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="panel space-y-3 rounded-lg p-5">
          <div className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--color-paper)]/45">Choose the winning container</div>
          {eligible.map((s) => {
            const isChosen = s.index === chosen;
            const isAI = verdict?.recommendedIndex === s.index;
            return (
              <button
                key={s.index}
                onClick={() => selectWinner(s.index)}
                disabled={finalized}
                className="flex w-full items-center gap-3 rounded-md border p-3 text-left transition-all"
                style={{
                  borderColor: isChosen ? "color-mix(in srgb, var(--color-bullion) 55%, transparent)" : "rgba(207,199,184,0.12)",
                  background: isChosen ? "color-mix(in srgb, var(--color-bullion) 10%, transparent)" : "transparent",
                }}
              >
                <OpenContainer size={64} color={isChosen ? "var(--color-bullion)" : "var(--color-teal)"} />
                <div className="flex-1">
                  <div className="font-mono text-[13px] text-[var(--color-paper)]/75">{shortAddress(s.participant)}</div>
                  <div className="mt-0.5 flex gap-1.5">
                    {isAI && <Badge color="var(--color-ai)"><Cpu size={11} /> AI Pick</Badge>}
                    {isChosen && <Badge color="var(--color-bullion)"><Crown size={11} /> Chosen</Badge>}
                  </div>
                </div>
              </button>
            );
          })}
          {override && (
            <div className="panel rounded-md border-[var(--color-owner)]/35 p-3.5">
              <p className="text-[14px] text-[var(--color-paper)]/85">
                <b className="text-[var(--color-owner)]">Human override.</b> You are releasing a winner different from the AI pick. Allowed — the human decides.
              </p>
            </div>
          )}
        </div>

        <div className="panel flex flex-col items-center justify-center gap-4 rounded-lg p-6">
          <div className="relative grid h-[170px] place-items-center">
            <RewardVault charged open={finalized} />
            <AnimatePresence>
              {finalized && Array.from({ length: 6 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute h-1.5 w-3 rounded-[1px] bg-[var(--color-bullion)]"
                  style={{ left: "50%", top: "40%" }}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: [0, 1, 0], x: [0, 120] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="text-center">
            <div className="text-[13px] font-bold uppercase tracking-wide text-[var(--color-paper)]/45">Payout preview</div>
            <div className="text-[24px] font-bold text-[var(--color-bullion)]">{formatReward(bounty.reward, bounty.rewardSymbol)}</div>
            <div className="font-mono text-[13px] text-[var(--color-paper)]/60">→ {shortAddress(eligible.find((s) => s.index === chosen)?.participant)}</div>
          </div>
          {finalized ? (
            <Badge color="var(--color-bullion)" dot>Released & paid</Badge>
          ) : (
            <Button variant="gold" size="lg" className="w-full" onClick={() => setConfirm(true)} disabled={busy}>
              <PenLine size={17} /> Sign release & pay
            </Button>
          )}
        </div>
      </div>

      <SafetyConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Sign the release manifest?"
        description="This opens the reward vault and pays the chosen container. It cannot be undone."
        accent="var(--color-bullion)"
        confirmVariant="gold"
        confirmLabel="Sign & release"
        busy={busy}
        onConfirm={release}
        checklist={[
          `${formatReward(bounty.reward, bounty.rewardSymbol)} will be paid to the chosen container.`,
          override ? "You are overriding the AI recommendation (human decides)." : "You are confirming the AI-recommended winner.",
          "The reward release is final.",
        ]}
      />
      <span className="sr-only"><PackageCheck /></span>
    </StageScaffold>
  );
}
