import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Container, X } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { CargoContainerCard } from "@/components/cargo/CargoContainerCard";

/** Fullscreen cargo registry — every submission as a container card (no table). */
export function CargoRegistryDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { submissions } = useCargoStore();
  const eligible = submissions.filter((s) => s.eligible).length;

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
                className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                className="panel fixed inset-x-0 bottom-0 z-[81] flex max-h-[88vh] flex-col rounded-t-2xl p-5"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-concrete)]/15 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Container size={20} className="text-[var(--color-safety)]" />
                    <Dialog.Title className="text-[22px] font-bold uppercase tracking-wide text-[var(--color-paper)]">
                      Cargo Registry
                    </Dialog.Title>
                    <span className="text-[13px] text-[var(--color-paper)]/50">
                      {submissions.length} containers · {eligible} eligible
                    </span>
                  </div>
                  <Dialog.Close className="grid h-9 w-9 place-items-center rounded-md border border-[var(--color-concrete)]/20 text-[var(--color-paper)]/70 hover:text-[var(--color-paper)]">
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <div className="mt-4 grid gap-3 overflow-y-auto pr-1 thin-scroll md:grid-cols-2">
                  {submissions.length === 0 ? (
                    <p className="text-[14px] text-[var(--color-paper)]/55">No cargo loaded yet.</p>
                  ) : (
                    submissions.map((s) => <CargoContainerCard key={s.index} submission={s} />)
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
