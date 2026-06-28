import { HelpCircle, Plug, Boxes } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RitualNetworkBadge } from "@/components/cargo/RitualNetworkBadge";
import { shortAddress } from "@/lib/utils";

/** Terminal header bar — identity, network, wallet, help. */
export function TopBar({ onHelp }: { onHelp: () => void }) {
  const { network, address, bounty, connect, busy } = useCargoStore();

  return (
    <header className="panel flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-[var(--color-safety)]/12 text-[var(--color-safety)]">
          <Boxes size={22} />
        </div>
        <div className="leading-tight">
          <div className="text-[18px] font-black uppercase tracking-wider text-[var(--color-paper)]">
            Blind Cargo Judge
          </div>
          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--color-safety)]/70">
            Sealed Submission Freight System
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RitualNetworkBadge status={network} />
        {bounty && <Badge color="var(--color-bullion)">Bounty #{bounty.id.toString()}</Badge>}
        {address ? (
          <span className="hidden items-center gap-1.5 rounded-sm border border-[var(--color-concrete)]/20 bg-black/30 px-3 py-1.5 font-mono text-[13px] text-[var(--color-paper)]/80 sm:inline-flex">
            <Plug size={14} className="text-[var(--color-teal)]" />
            {shortAddress(address)}
          </span>
        ) : (
          <Button variant="safety" size="sm" onClick={connect} disabled={busy}>
            <Plug size={15} /> Connect
          </Button>
        )}
        <button
          onClick={onHelp}
          aria-label="Help"
          className="grid h-9 w-9 place-items-center rounded-md border border-[var(--color-concrete)]/20 text-[var(--color-paper)]/70 transition-colors hover:border-[var(--color-teal)]/45 hover:text-[var(--color-teal)]"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
