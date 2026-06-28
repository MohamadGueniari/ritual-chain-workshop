import { motion } from "framer-motion";
import { Crown, Cpu } from "lucide-react";
import type { Submission } from "@/types";
import { SealedContainer, OpenContainer, RejectedContainer } from "./CargoGlyphs";
import { BarcodeHashLabel } from "./BarcodeHashLabel";
import { Badge } from "@/components/ui/Badge";
import { shortAddress } from "@/lib/utils";

const STATUS_META: Record<Submission["status"], { label: string; color: string }> = {
  sealed: { label: "Sealed Container", color: "var(--color-sealed)" },
  opened: { label: "Opened Container", color: "var(--color-teal)" },
  rejected: { label: "Rejected Container", color: "var(--color-alarm)" },
  unrevealed: { label: "Unrevealed Container", color: "var(--color-concrete)" },
  "ai-pick": { label: "AI Pick Container", color: "var(--color-ai)" },
  winner: { label: "Released Winner", color: "var(--color-bullion)" },
};

export function CargoContainerCard({ submission }: { submission: Submission }) {
  const meta = STATUS_META[submission.status];
  const isWinner = submission.status === "winner";
  const isPick = submission.status === "ai-pick";

  const glyph = (() => {
    if (submission.status === "rejected") return <RejectedContainer size={120} />;
    if (submission.status === "sealed" || submission.status === "unrevealed")
      return <SealedContainer size={120} />;
    if (isWinner) return <OpenContainer size={120} color="var(--color-bullion)" />;
    if (isPick) return <OpenContainer size={120} color="var(--color-ai)" />;
    return <OpenContainer size={120} />;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel rivets flex gap-4 rounded-md p-4"
      style={{
        borderColor: `color-mix(in srgb, ${meta.color} ${isWinner ? 60 : 28}%, transparent)`,
        boxShadow: isWinner
          ? "0 0 30px -8px var(--color-bullion)"
          : isPick
            ? "0 0 24px -10px var(--color-ai)"
            : "none",
      }}
    >
      <div className="mx-2 grid shrink-0 place-items-center">{glyph}</div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={meta.color} dot>
            {isWinner && <Crown size={12} />}
            {isPick && <Cpu size={12} />}
            {meta.label}
          </Badge>
          {submission.eligible && submission.status === "opened" && (
            <Badge color="var(--color-teal)">Eligible</Badge>
          )}
          {submission.aiScore != null && <Badge color="var(--color-ai)">Score {submission.aiScore}</Badge>}
        </div>

        <div className="mt-2 font-mono text-[13px] text-[var(--color-paper)]/65">
          {shortAddress(submission.participant)}
        </div>

        <div className="mt-1.5">
          <BarcodeHashLabel hash={submission.commitment} />
        </div>

        {submission.revealedAnswer ? (
          <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-[var(--color-paper)]/85">
            {submission.revealedAnswer}
          </p>
        ) : (
          <p className="mt-2 text-[13px] font-medium uppercase tracking-wide text-[var(--color-paper)]/40">
            Contents hidden until customs reveal
          </p>
        )}
      </div>
    </motion.div>
  );
}
