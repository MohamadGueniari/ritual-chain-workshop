import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";

export interface SafetyConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  checklist: string[];
  confirmLabel: string;
  confirmVariant?: ButtonProps["variant"];
  accent?: string;
  onConfirm: () => void;
  busy?: boolean;
}

/* Heavy glass/metal confirmation panel with a safety checklist. */
export function SafetyConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  checklist,
  confirmLabel,
  confirmVariant = "safety",
  accent = "var(--color-safety)",
  onConfirm,
  busy,
}: SafetyConfirmProps) {
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
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="panel rivets fixed left-1/2 top-1/2 z-[91] w-[min(94vw,540px)] -translate-x-1/2 -translate-y-1/2 rounded-lg p-7"
                style={{ borderColor: `color-mix(in srgb, ${accent} 50%, transparent)` }}
              >
                <div className="mx-2">
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-md"
                    style={{
                      color: accent,
                      background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${accent} 45%, transparent)`,
                    }}
                  >
                    <ShieldCheck size={22} />
                  </div>

                  <Dialog.Title className="text-[26px] font-bold leading-tight text-[var(--color-paper)]">
                    {title}
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-[15px] leading-relaxed text-[var(--color-paper)]/70">
                    {description}
                  </Dialog.Description>

                  <ul className="mt-5 space-y-2.5">
                    {checklist.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm"
                          style={{ color: accent, background: `color-mix(in srgb, ${accent} 16%, transparent)` }}
                        >
                          <Check size={13} />
                        </span>
                        <span className="text-[14px] leading-snug text-[var(--color-paper)]/80">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex items-center justify-end gap-3">
                    <Dialog.Close asChild>
                      <Button variant="steel" size="md">Cancel</Button>
                    </Dialog.Close>
                    <Button variant={confirmVariant} size="md" onClick={onConfirm} disabled={busy}>
                      {busy ? "Processing…" : confirmLabel}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
