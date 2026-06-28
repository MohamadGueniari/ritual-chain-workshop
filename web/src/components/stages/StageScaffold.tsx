import { motion } from "framer-motion";

/** Shared cargo-bay scene wrapper — big title block + entrance/exit motion. */
export function StageScaffold({
  tag,
  title,
  intro,
  accent = "var(--color-safety)",
  children,
}: {
  tag: string;
  title: string;
  intro: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full flex-col"
    >
      <div className="mb-5">
        <div className="text-[13px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
          {tag}
        </div>
        <h2 className="mt-1 text-[34px] font-black uppercase leading-none tracking-tight text-[var(--color-paper)] sm:text-[44px]">
          {title}
        </h2>
        <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-[var(--color-paper)]/70">{intro}</p>
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}
