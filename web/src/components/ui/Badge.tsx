import { cn } from "@/lib/utils";

export function Badge({
  children,
  color = "var(--color-safety)",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider",
        className
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      {dot && (
        <span
          className="h-2 w-2 rounded-full bc-pulse"
          style={{ background: color, color }}
        />
      )}
      {children}
    </span>
  );
}
