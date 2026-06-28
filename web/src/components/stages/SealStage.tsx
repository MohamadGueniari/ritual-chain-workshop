import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dice5, Eye, EyeOff, Lock, Download, Send } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Textarea, FieldLabel } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { BarcodeHashLabel } from "@/components/cargo/BarcodeHashLabel";
import { CopyHashButton } from "@/components/cargo/CopyHashButton";
import { SealedContainer } from "@/components/cargo/CargoGlyphs";
import { SafetyConfirmDialog } from "@/components/modals/SafetyConfirmDialog";
import { useToast } from "@/components/feedback/Toaster";
import { generateSalt, computeCommitment } from "@/lib/crypto";
import { saveRevealKit, downloadRevealKit } from "@/lib/revealKit";
import { shortHash } from "@/lib/utils";
import type { Hex } from "viem";

/** Stage 3 — Seal Cargo. Answer folds into a container, salt locks it, barcode prints. */
export function SealStage() {
  const { bounty, address, submitCommitment, busy } = useCargoStore();
  const toast = useToast();
  const [answer, setAnswer] = useState("");
  const [salt, setSalt] = useState<Hex | null>(null);
  const [showSalt, setShowSalt] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const sender = (address ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const commitment = useMemo(() => {
    if (!salt || !answer.trim() || !bounty) return null;
    return computeCommitment(answer.trim(), salt, sender, bounty.id);
  }, [salt, answer, sender, bounty]);

  const state = !answer.trim() ? "empty" : !salt ? "loaded" : "sealed";

  async function commit() {
    if (!commitment || !salt || !bounty) return;
    saveRevealKit({ bountyId: bounty.id.toString(), answer: answer.trim(), salt, commitment, savedAt: Date.now() });
    await submitCommitment(commitment);
    setConfirm(false);
    toast("success", "Cargo sealed. Only the barcode hash went on-chain.");
    setAnswer("");
    setSalt(null);
  }

  return (
    <StageScaffold
      tag="Checkpoint 03"
      title="Seal Cargo"
      intro="Your answer is sealed. Only the barcode hash goes on-chain. Save your answer and salt for customs reveal."
      accent="var(--color-sealed)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="panel space-y-4 rounded-lg p-5">
          <div>
            <FieldLabel hint="hidden until reveal">Your answer</FieldLabel>
            <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer. It is never sent on-chain in the clear." />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="steel" size="sm" onClick={() => setSalt(generateSalt())}>
              <Dice5 size={15} /> {salt ? "Regenerate key" : "Generate salt key"}
            </Button>
            {salt && (
              <button onClick={() => setShowSalt((v) => !v)} className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--color-paper)]/65 hover:text-[var(--color-teal)]">
                {showSalt ? <EyeOff size={14} /> : <Eye size={14} />} {showSalt ? "Hide" : "Show"}
              </button>
            )}
          </div>

          {salt && (
            <div className="rounded-md border border-[var(--color-concrete)]/15 bg-black/30 p-3">
              <div className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/45">Customs key (salt)</div>
              <div className="mt-1 font-mono text-[13px] text-[var(--color-teal)] break-all">
                {showSalt ? salt : shortHash(salt, 14, 10)}
              </div>
            </div>
          )}

          <div className="rounded-md border border-[var(--color-concrete)]/15 bg-black/25 p-3">
            <div className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/45">Commitment formula</div>
            <code className="mt-1 block font-mono text-[13px] leading-relaxed text-[var(--color-safety)]/90">
              keccak256(answer, salt, msg.sender, bountyId)
            </code>
          </div>

          {commitment && (
            <div className="rounded-md border border-[var(--color-safety)]/30 bg-[var(--color-safety)]/6 p-3">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/55">Barcode hash (goes on-chain)</div>
              <div className="flex flex-wrap items-center gap-2">
                <BarcodeHashLabel hash={commitment} color="var(--color-safety)" />
                <CopyHashButton value={commitment} />
              </div>
            </div>
          )}
        </div>

        <div className="panel flex flex-col items-center justify-center gap-5 rounded-lg p-6">
          <div className="relative grid h-[180px] place-items-center">
            <SealedContainer size={200} accent={state === "sealed" ? "var(--color-safety)" : "var(--color-sealed)"} locked={state === "sealed"} />
            <AnimatePresence>
              {state === "loaded" && (
                <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute h-1.5 w-3 rounded-[1px] bg-[var(--color-safety)]"
                      style={{ left: "50%", top: "10%" }}
                      animate={{ y: [0, 80], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-center text-[14px] font-medium text-[var(--color-paper)]/65">
            {state === "empty" && "Load an answer into the container."}
            {state === "loaded" && "Answer loading into the container…"}
            {state === "sealed" && "Container locked. Barcode printed."}
          </div>

          {commitment && bounty && (
            <div className="flex w-full flex-col gap-2">
              <Button variant="steel" size="sm" onClick={() => downloadRevealKit({ bountyId: bounty.id.toString(), answer: answer.trim(), salt: salt!, commitment, savedAt: Date.now() })}>
                <Download size={15} /> Download reveal kit
              </Button>
              <Button variant="safety" size="lg" onClick={() => setConfirm(true)} disabled={busy}>
                <Send size={17} /> Submit commitment
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="panel mt-4 flex items-start gap-2.5 rounded-md border-[var(--color-safety)]/30 p-3.5">
        <Lock size={17} className="mt-0.5 text-[var(--color-safety)]" />
        <p className="text-[14px] text-[var(--color-paper)]/80">
          Save your reveal kit. Without your answer <b>and</b> salt you cannot pass customs, and the container can never open.
        </p>
      </div>

      <SafetyConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Submit this commitment?"
        description="Only the barcode hash is published. Your answer stays sealed until you reveal it at customs."
        accent="var(--color-safety)"
        confirmVariant="safety"
        confirmLabel="Seal & submit"
        busy={busy}
        onConfirm={commit}
        checklist={[
          "Only the barcode hash goes on-chain — not your answer.",
          "Your answer + salt are saved locally as a reveal kit.",
          "You will need both to reveal after the loading cutoff.",
          "Reveal must match answer + salt + sender + bountyId.",
        ]}
      />
    </StageScaffold>
  );
}
