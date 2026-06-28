import { useState } from "react";
import { Fuel } from "lucide-react";
import { formatEther } from "viem";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InspectionMachine } from "@/components/cargo/CargoGlyphs";
import { SafetyConfirmDialog } from "@/components/modals/SafetyConfirmDialog";
import { useToast } from "@/components/feedback/Toaster";
import { useRitualWallet } from "@/hooks/useRitualWallet";
import { MIN_LLM_BALANCE, DEPOSIT_AMOUNT } from "@/lib/ritualWallet";

/** Stage 5 — Fuel Inspection. Real RitualWallet escrow funds the AI machine. */
export function FuelStage() {
  const { bounty } = useCargoStore();
  const toast = useToast();
  const { status, depositing, deposit, refresh } = useRitualWallet();
  const [confirm, setConfirm] = useState(false);
  if (!bounty) return null;

  const balance = status ? Number(formatEther(status.balance)) : 0;
  const required = Number(formatEther(MIN_LLM_BALANCE));
  const depositAmt = Number(formatEther(DEPOSIT_AMOUNT));
  const ready = status?.ready === true;
  const power = Math.min(1, balance / required);

  async function fund() {
    try {
      await deposit();
      toast("success", "Inspection powered — fuel escrow funded and locked.");
    } catch {
      toast("error", "Deposit failed. Check your wallet and try again.");
    } finally {
      setConfirm(false);
    }
  }

  return (
    <StageScaffold
      tag="Checkpoint 05"
      title="Fuel Inspection"
      intro="Fund the AI inspection. The Ritual LLM precompile charges your RitualWallet escrow — about 0.32 RITUAL deposited and locked powers a batch run."
      accent="var(--color-ai)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="panel space-y-4 rounded-lg p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Fuel balance" value={`${balance.toFixed(3)} RITUAL`} color="var(--color-ai)" />
            <Metric label="Minimum required" value={`${required.toFixed(2)} RITUAL`} color="var(--color-owner)" />
          </div>
          {status && (
            <div className="panel rounded-md p-3.5 text-[14px] text-[var(--color-paper)]/70">
              Lock {status.hasEnoughLockDuration ? "is sufficient" : "needs extending"} ·{" "}
              {status.hasEnoughBalance ? "balance is sufficient" : "balance is low"}.
            </div>
          )}
          <Badge color={ready ? "var(--color-ai)" : "var(--color-owner)"} dot>
            {ready ? "Inspection powered" : "Not powered — load fuel"}
          </Badge>
          <Button variant="ai" size="lg" onClick={() => setConfirm(true)} disabled={depositing}>
            <Fuel size={17} /> {depositing ? "Loading…" : `Deposit ${depositAmt} RITUAL`}
          </Button>
          <button onClick={() => void refresh()} className="block text-[13px] font-bold uppercase tracking-wide text-[var(--color-paper)]/55 hover:text-[var(--color-ai)]">
            Refresh fuel status
          </button>
        </div>

        <div className="panel flex flex-col items-center justify-center gap-3 rounded-lg p-6">
          <InspectionMachine size={240} power={power} scanning={false} />
          <div className="text-center text-[14px] font-medium text-[var(--color-paper)]/65">
            {ready ? "Power gauge full — batch inspection ready." : power > 0 ? "Gauge filling — load more fuel to power up." : "Machine is cold. Load fuel cells to power it."}
          </div>
        </div>
      </div>

      <SafetyConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Fund the AI inspection?"
        description="This deposits RITUAL into the Ritual LLM escrow (RitualWallet) and locks it long enough to cover the async inspection callback."
        accent="var(--color-ai)"
        confirmVariant="ai"
        confirmLabel={`Deposit ${depositAmt} RITUAL`}
        busy={depositing}
        onConfirm={fund}
        checklist={[
          `You are loading ${depositAmt} RITUAL of inference fuel.`,
          "Funds stay locked to cover the async TEE callback.",
          "Inspection evaluates every opened container in one batch.",
        ]}
      />
    </StageScaffold>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="panel rounded-md p-4">
      <div className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-paper)]/45">{label}</div>
      <div className="mt-1 text-[18px] font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
