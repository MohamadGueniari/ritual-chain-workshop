import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

/* Cargo toasts: small labelled crates that slide in, stamped on success. */

type ToastKind = "success" | "warning" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const COLOR: Record<ToastKind, string> = {
  success: "var(--color-teal)",
  warning: "var(--color-safety)",
  error: "var(--color-alarm)",
  info: "var(--color-ai)",
};
const ICON = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Info };

const ToastCtx = createContext<(kind: ToastKind, message: string) => void>(() => {});
export function useToast() {
  return useContext(ToastCtx);
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-28 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICON[t.kind];
            const color = COLOR[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="panel pointer-events-auto flex items-start gap-3 rounded-md px-4 py-3"
                style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }}
              >
                <Icon size={20} style={{ color }} className="mt-0.5 shrink-0" />
                <p className="text-[14px] font-medium leading-snug text-[var(--color-paper)]/90">
                  {t.message}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
