import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* Heavy mechanical switch — presses down on click, metal shine on hover. */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-md font-semibold uppercase tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-[1px] border-b-[3px] active:border-b-0 active:mt-[3px]",
  {
    variants: {
      variant: {
        safety:
          "bg-[var(--color-safety)]/15 text-[var(--color-safety)] border border-[var(--color-safety)]/40 border-b-[var(--color-safety)]/60 hover:bg-[var(--color-safety)]/25 focus-visible:ring-[var(--color-safety)]/50",
        teal:
          "bg-[var(--color-teal)]/14 text-[var(--color-teal)] border border-[var(--color-teal)]/40 border-b-[var(--color-teal)]/60 hover:bg-[var(--color-teal)]/24 focus-visible:ring-[var(--color-teal)]/50",
        owner:
          "bg-[var(--color-owner)]/15 text-[var(--color-owner)] border border-[var(--color-owner)]/45 border-b-[var(--color-owner)]/65 hover:bg-[var(--color-owner)]/25 focus-visible:ring-[var(--color-owner)]/50",
        ai: "bg-[var(--color-ai)]/14 text-[var(--color-ai)] border border-[var(--color-ai)]/40 border-b-[var(--color-ai)]/60 hover:bg-[var(--color-ai)]/24 focus-visible:ring-[var(--color-ai)]/50",
        gold: "bg-[var(--color-bullion)]/15 text-[var(--color-bullion)] border border-[var(--color-bullion)]/50 border-b-[var(--color-bullion)]/70 hover:bg-[var(--color-bullion)]/25 focus-visible:ring-[var(--color-bullion)]/55",
        steel:
          "bg-white/[0.04] text-[var(--color-paper)]/85 border border-[var(--color-concrete)]/20 border-b-[var(--color-concrete)]/30 hover:bg-white/[0.08] focus-visible:ring-[var(--color-concrete)]/30",
        danger:
          "bg-[var(--color-alarm)]/14 text-[var(--color-alarm)] border border-[var(--color-alarm)]/45 border-b-[var(--color-alarm)]/65 hover:bg-[var(--color-alarm)]/24 focus-visible:ring-[var(--color-alarm)]/50",
      },
      size: {
        sm: "h-9 px-4 text-[14px]",
        md: "h-11 px-5 text-[16px]",
        lg: "h-14 px-7 text-[17px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "safety", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
