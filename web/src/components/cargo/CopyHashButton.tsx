import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

/** Copy button that prints a small "COPIED" stamp on success. */
export function CopyHashButton({ value, label = "Copy hash" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function handle() {
    if (await copyToClipboard(value)) {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    }
  }

  return (
    <button
      onClick={handle}
      className="relative inline-flex items-center gap-1.5 rounded-sm border border-[var(--color-concrete)]/20 bg-white/[0.04] px-2.5 py-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--color-paper)]/75 transition-colors hover:border-[var(--color-teal)]/45 hover:text-[var(--color-teal)]"
    >
      {done ? <Check size={14} className="text-[var(--color-teal)]" /> : <Copy size={14} />}
      {done ? "Copied" : label}
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ opacity: 0, scale: 2, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -right-1 -top-3 rounded-sm border border-[var(--color-teal)] px-1 text-[9px] font-black text-[var(--color-teal)]"
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
