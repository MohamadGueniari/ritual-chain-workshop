import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/* Control-panel inputs — glow like active panels on focus. */

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-[var(--color-concrete)]/15 bg-black/35 px-4 py-3 text-[16px] text-[var(--color-paper)] placeholder:text-[var(--color-paper)]/35 outline-none transition-all duration-200 focus:border-[var(--color-safety)]/60 focus:shadow-[0_0_20px_-6px_var(--color-safety)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-y rounded-md border border-[var(--color-concrete)]/15 bg-black/35 px-4 py-3 text-[16px] leading-relaxed text-[var(--color-paper)] placeholder:text-[var(--color-paper)]/35 outline-none transition-all duration-200 focus:border-[var(--color-safety)]/60 focus:shadow-[0_0_20px_-6px_var(--color-safety)]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function FieldLabel({
  children,
  hint,
  accent = "var(--color-safety)",
}: {
  children: React.ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label className="text-[14px] font-bold uppercase tracking-wider" style={{ color: accent }}>
        {children}
      </label>
      {hint && <span className="text-[13px] text-[var(--color-paper)]/45">{hint}</span>}
    </div>
  );
}
