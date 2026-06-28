import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ScanLine, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { BarcodeHashLabel } from "@/components/cargo/BarcodeHashLabel";
import { SealedContainer, OpenContainer, RejectedContainer } from "@/components/cargo/CargoGlyphs";
import { SafetyConfirmDialog } from "@/components/modals/SafetyConfirmDialog";
import { useToast } from "@/components/feedback/Toaster";
import { computeCommitment } from "@/lib/crypto";
import { loadRevealKit, type RevealKitEntry } from "@/lib/revealKit";

/** Stage 4 — Customs Reveal. Scanner compares two barcodes; match opens the container. */
export function RevealStage() {
  const { bounty, address, revealAnswer, busy } = useCargoStore();
  const toast = useToast();
  const [kit, setKit] = useState<RevealKitEntry | null>(null);
  const [confirm, setConfirm] = useState(false);
  const sender = (address ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

  useEffect(() => {
    if (bounty) setKit(loadRevealKit(bounty.id.toString()));
  }, [bounty]);

  const recomputed = useMemo(() => {
    if (!kit || !bounty) return null;
    return computeCommitment(kit.answer, kit.salt, sender, bounty.id);
  }, [kit, bounty, sender]);

  const matches = useMemo(() => {
    if (!kit || !recomputed) return null;
    return recomputed.toLowerCase() === kit.commitment.toLowerCase();
  }, [kit, recomputed]);

  async function reveal() {
    if (!kit) return;
    await revealAnswer(kit.answer, kit.salt);
    setConfirm(false);
    toast("success", "Barcode match confirmed. Container marked eligible.");
  }

  return (
    <StageScaffold
      tag="Checkpoint 04"
      title="Customs Reveal"
      intro="Open your container at customs. Reveal requires answer + salt. Only verified reveals are eligible."
      accent="var(--color-teal)"
    >
      {!kit ? (
        <div className="panel bc-shake flex items-start gap-3 rounded-md border-[var(--color-safety)]/45 p-5">
          <AlertTriangle size={20} className="mt-0.5 text-[var(--color-safety)]" />
          <div>
            <div className="text-[16px] font-bold uppercase tracking-wide text-[var(--color-paper)]">Reveal kit missing</div>
            <p className="mt-1 text-[14px] text-[var(--color-paper)]/70">
              No saved answer + salt for this bounty in this browser. Customs cannot open a container without its key.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="panel space-y-4 rounded-lg p-5">
            <BarcodeRow label="On-chain barcode" hash={kit.commitment} color="var(--color-sealed)" />
            {/* scanner */}
            <div className="relative h-8 overflow-hidden rounded-sm border border-[var(--color-concrete)]/15 bg-black/40">
              <div className="absolute inset-y-0 w-1/3 bc-scan" style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-teal) 50%, transparent), transparent)" }} />
              <div className="grid h-full place-items-center text-[11px] font-bold uppercase tracking-widest text-[var(--color-paper)]/50">
                Customs scanner
              </div>
            </div>
            <BarcodeRow label="Recomputed barcode" hash={recomputed ?? "—"} color={matches ? "var(--color-teal)" : "var(--color-alarm)"} />

            <div
              className="flex items-center gap-2.5 rounded-md border p-3.5"
              style={{
                borderColor: matches ? "color-mix(in srgb, var(--color-teal) 45%, transparent)" : "color-mix(in srgb, var(--color-alarm) 45%, transparent)",
                background: matches ? "color-mix(in srgb, var(--color-teal) 8%, transparent)" : "color-mix(in srgb, var(--color-alarm) 8%, transparent)",
              }}
            >
              {matches ? <CheckCircle2 size={18} className="text-[var(--color-teal)]" /> : <XCircle size={18} className="text-[var(--color-alarm)]" />}
              <p className="text-[14px] font-medium text-[var(--color-paper)]/85">
                {matches ? "Barcode match confirmed. Reveal accepted." : "Hash mismatch. Container rejected."}
              </p>
            </div>

            <Button variant="teal" size="lg" className="w-full" disabled={!matches || busy} onClick={() => setConfirm(true)}>
              <ScanLine size={17} /> Open at customs
            </Button>
            {!matches && (
              <p className="text-center text-[13px] text-[var(--color-alarm)]/80">
                Reveal is blocked while the barcodes don't match — it would only waste a transaction.
              </p>
            )}
          </div>

          <div className="panel flex flex-col items-center justify-center gap-4 rounded-lg p-6">
            <motion.div animate={{ scale: matches ? 1 : 0.94 }} className="grid h-[180px] place-items-center">
              {matches === null ? <SealedContainer size={200} /> : matches ? <OpenContainer size={200} /> : <RejectedContainer size={200} />}
            </motion.div>
            <p className="text-center text-[14px] font-medium text-[var(--color-paper)]/65">
              {matches === null && "Load your reveal kit to scan barcodes."}
              {matches === true && "Gate open — container verified and eligible."}
              {matches === false && "Container diverted — a mismatched reveal cannot open."}
            </p>
          </div>
        </div>
      )}

      <SafetyConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Open this container?"
        description="Your answer becomes public and the container becomes eligible for batch inspection."
        accent="var(--color-teal)"
        confirmVariant="teal"
        confirmLabel="Open at customs"
        busy={busy}
        onConfirm={reveal}
        checklist={[
          "Your answer will be published on-chain.",
          "The barcodes already match your sealed commitment.",
          "Only verified reveals are eligible for judging.",
        ]}
      />
    </StageScaffold>
  );
}

function BarcodeRow({ label, hash, color }: { label: string; hash: string; color: string }) {
  return (
    <div className="rounded-md border border-[var(--color-concrete)]/12 bg-black/25 p-3">
      <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/45">{label}</div>
      <BarcodeHashLabel hash={hash} color={color} full />
    </div>
  );
}
