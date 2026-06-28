import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Ruler, Clock, Coins } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Input, Textarea, FieldLabel } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { RewardVault } from "@/components/cargo/CargoGlyphs";
import { SafetyConfirmDialog } from "@/components/modals/SafetyConfirmDialog";
import { useToast } from "@/components/feedback/Toaster";

/** Stage 1 — Bounty Manifest. A heavy-duty digital manifest, not a plain form. */
export function ManifestStage() {
  const { createBounty, busy } = useCargoStore();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [rubric, setRubric] = useState("");
  const [reward, setReward] = useState("5");
  const [subMin, setSubMin] = useState("20");
  const [revMin, setRevMin] = useState("40");
  const [confirm, setConfirm] = useState(false);

  const valid = title.trim() && rubric.trim() && Number(reward) > 0;

  async function create() {
    const now = Date.now();
    await createBounty({
      title: title.trim(),
      rubric: rubric.trim(),
      reward: Number(reward),
      submissionDeadline: now + Number(subMin) * 60 * 1000, // Ritual deadlines in ms
      revealDeadline: now + Number(revMin) * 60 * 1000,
    });
    setConfirm(false);
    toast("success", "Bounty manifest created. Reward locked in the vault.");
  }

  return (
    <StageScaffold
      tag="Checkpoint 01"
      title="Bounty Manifest"
      intro="Create the bounty manifest. Define the inspection rules. Lock the reward before loading begins."
      accent="var(--color-owner)"
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="panel rivets space-y-5 rounded-lg p-6">
          <div>
            <FieldLabel hint="manifest name" accent="var(--color-owner)">
              <span className="inline-flex items-center gap-1.5"><FileText size={14} /> Bounty title</span>
            </FieldLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Best Ritual Private Judge Design" />
          </div>
          <div>
            <FieldLabel hint="inspection rules" accent="var(--color-owner)">
              <span className="inline-flex items-center gap-1.5"><Ruler size={14} /> Evaluation rubric</span>
            </FieldLabel>
            <Textarea rows={4} value={rubric} onChange={(e) => setRubric(e.target.value)} placeholder="What should the AI reward? e.g. correctness, originality, privacy preserved." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel hint="loading cutoff" accent="var(--color-owner)">
                <span className="inline-flex items-center gap-1.5"><Clock size={14} /> Submission (min)</span>
              </FieldLabel>
              <Input type="number" min={1} value={subMin} onChange={(e) => setSubMin(e.target.value)} />
            </div>
            <div>
              <FieldLabel hint="customs cutoff" accent="var(--color-owner)">
                <span className="inline-flex items-center gap-1.5"><Clock size={14} /> Reveal (min)</span>
              </FieldLabel>
              <Input type="number" min={1} value={revMin} onChange={(e) => setRevMin(e.target.value)} />
            </div>
          </div>
          <Button variant="owner" size="lg" disabled={!valid || busy} onClick={() => setConfirm(true)}>
            <FileText size={18} /> Create manifest & lock reward
          </Button>
        </div>

        <div className="panel flex flex-col items-center justify-center gap-4 rounded-lg p-6">
          <FieldLabel accent="var(--color-bullion)">
            <span className="inline-flex items-center gap-1.5"><Coins size={14} /> Locked vault amount</span>
          </FieldLabel>
          <motion.div animate={{ scale: valid ? 1.05 : 1 }}>
            <RewardVault charged={Number(reward) > 0} />
          </motion.div>
          <div className="flex items-center gap-2">
            <Input type="number" min={0} step="0.5" value={reward} onChange={(e) => setReward(e.target.value)} className="w-24 text-center font-mono text-[18px]" />
            <span className="text-[16px] font-bold text-[var(--color-bullion)]">RITUAL</span>
          </div>
          <p className="text-center text-[13px] text-[var(--color-paper)]/55">
            The reward locks into the vault until a winner is released.
          </p>
        </div>
      </div>

      <SafetyConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Create this manifest?"
        description="This locks the reward in the vault and opens the commit phase. Participants can then seal cargo."
        accent="var(--color-owner)"
        confirmVariant="owner"
        confirmLabel="Create & lock"
        busy={busy}
        onConfirm={create}
        checklist={[
          `Reward of ${reward} RITUAL locks into the vault.`,
          "The rubric defines how the AI inspects cargo.",
          "You, the owner, fund, judge and release.",
          "Deadlines use Ritual time (milliseconds).",
        ]}
      />
    </StageScaffold>
  );
}
