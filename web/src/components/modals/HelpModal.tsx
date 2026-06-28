import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Package, ScanLine, Boxes, Stamp } from "lucide-react";

const STEPS = [
  {
    icon: Package,
    color: "var(--color-sealed)",
    title: "1 · Seal the cargo",
    body: "Your answer is packed into a sealed container. Only the barcode hash goes on-chain — the answer stays hidden during the commit phase.",
  },
  {
    icon: ScanLine,
    color: "var(--color-teal)",
    title: "2 · Customs reveal",
    body: "After the loading cutoff you reveal answer + salt. Customs scans both barcodes; if they match, the container opens and becomes eligible.",
  },
  {
    icon: Boxes,
    color: "var(--color-ai)",
    title: "3 · Batch inspection",
    body: "Every verified container is inspected together in one batch by the Ritual AI — no one-by-one judging — and a winner is recommended.",
  },
  {
    icon: Stamp,
    color: "var(--color-bullion)",
    title: "4 · Human release",
    body: "The AI only recommends. The human owner signs the release manifest and the reward vault pays the winner.",
  },
];

export function HelpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <div className="fixed inset-0 z-[91] grid place-items-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className="panel w-[min(94vw,640px)] rounded-lg p-7"
                >
                <div className="mb-1 flex items-center gap-2.5">
                  <Package size={22} className="text-[var(--color-safety)]" />
                  <Dialog.Title className="text-[26px] font-bold text-[var(--color-paper)]">
                    How Blind Cargo Judge works
                  </Dialog.Title>
                </div>
                <Dialog.Description className="text-[15px] leading-relaxed text-[var(--color-paper)]/65">
                  A sealed-submission freight system. Answers are packed as cargo, opened at
                  customs, inspected by Ritual AI in one batch, and released by a human owner.
                </Dialog.Description>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {STEPS.map((s) => (
                    <div
                      key={s.title}
                      className="panel-glass rounded-md p-4"
                      style={{ borderColor: `color-mix(in srgb, ${s.color} 32%, transparent)` }}
                    >
                      <s.icon size={20} style={{ color: s.color }} />
                      <h4 className="mt-2 text-[15px] font-bold uppercase tracking-wide" style={{ color: s.color }}>
                        {s.title}
                      </h4>
                      <p className="mt-1 text-[14px] leading-snug text-[var(--color-paper)]/75">{s.body}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-center text-[14px] font-bold uppercase tracking-widest text-[var(--color-bullion)]">
                  AI recommends. Owner releases.
                </p>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
