import { motion } from "framer-motion";
import { Cpu, ArrowRight } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { shortAddress } from "@/lib/utils";

/** Stage 7 — AI Report. An inspection report prints; AI pick gets a blue stamp. */
export function ReportStage() {
  const { verdict, submissions, setStage } = useCargoStore();

  if (!verdict) {
    return (
      <StageScaffold tag="Checkpoint 07" title="AI Report" intro="Run batch inspection first to print the AI report." accent="var(--color-ai)">
        <p className="text-[15px] text-[var(--color-paper)]/55">No report yet.</p>
      </StageScaffold>
    );
  }

  const byIndex = new Map(submissions.map((s) => [s.index, s]));

  return (
    <StageScaffold
      tag="Checkpoint 07"
      title="AI Report"
      intro="AI report printed. This is a recommendation, not the final payout. Owner must approve the release."
      accent="var(--color-ai)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* printed report */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="panel rivets rounded-lg p-5"
          style={{ background: "linear-gradient(180deg, #1d2123, #15181a)" }}
        >
          <div className="mb-3 flex items-center justify-between border-b border-dashed border-[var(--color-concrete)]/25 pb-2">
            <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--color-ai)]">Inspection Report</span>
            <Badge color="var(--color-ai)">{verdict.confidence} confidence</Badge>
          </div>
          <div className="space-y-2.5">
            {verdict.ranking.map((r, i) => {
              const sub = byIndex.get(r.index);
              const isPick = r.index === verdict.recommendedIndex;
              return (
                <motion.div
                  key={r.index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-3 rounded-sm border p-2.5"
                  style={{
                    borderColor: isPick ? "color-mix(in srgb, var(--color-ai) 55%, transparent)" : "rgba(207,199,184,0.12)",
                    background: isPick ? "color-mix(in srgb, var(--color-ai) 10%, transparent)" : "transparent",
                  }}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-sm bg-black/40 font-mono text-[14px] text-[var(--color-paper)]/70">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] text-[var(--color-paper)]/75">{sub ? shortAddress(sub.participant) : `#${r.index}`}</span>
                      {isPick && <Badge color="var(--color-ai)"><Cpu size={11} /> AI Pick</Badge>}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--color-paper)]/60">{r.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-bold text-[var(--color-ai)]">{r.score}</div>
                    <div className="text-[10px] uppercase text-[var(--color-paper)]/40">score</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          <div className="panel rounded-lg p-5">
            <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[var(--color-ai)]">Summary</div>
            <p className="text-[15px] leading-relaxed text-[var(--color-paper)]/80">{verdict.summary}</p>
          </div>
          <div className="panel rounded-lg border-[var(--color-bullion)]/30 p-4">
            <p className="text-[14px] text-[var(--color-paper)]/80">
              <b className="text-[var(--color-bullion)]">AI recommends. Owner releases.</b> No payout has happened yet — the owner must sign the release.
            </p>
          </div>
          <Button variant="gold" size="lg" onClick={() => setStage("release")}>
            Go to release dock <ArrowRight size={17} />
          </Button>
        </div>
      </div>
    </StageScaffold>
  );
}
