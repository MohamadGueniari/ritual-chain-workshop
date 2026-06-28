import { shortHash } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** A barcode-style hash label stamped on a container. */
export function BarcodeHashLabel({
  hash,
  color = "var(--color-teal)",
  full = false,
  className,
}: {
  hash: string;
  color?: string;
  full?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-col gap-1 rounded-sm border bg-black/40 px-2.5 py-1.5",
        className
      )}
      style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}
      title={hash}
    >
      <span className="h-4 w-full barcode opacity-70" style={{ color }} aria-hidden />
      <span className={cn("font-mono text-[12px]", full && "break-all")} style={{ color }}>
        {full ? hash : shortHash(hash)}
      </span>
    </span>
  );
}
