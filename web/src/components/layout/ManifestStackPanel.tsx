import { Boxes, Container, Cpu, Trophy } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { Badge } from "@/components/ui/Badge";
import { RitualNetworkBadge } from "@/components/cargo/RitualNetworkBadge";
import { shortAddress, formatReward } from "@/lib/utils";
import { LoadManifestPanel } from "./LoadManifestPanel";
import type { UserRole } from "@/types";

const ROLE_COLOR: Record<UserRole, string> = {
  owner: "var(--color-owner)",
  participant: "var(--color-safety)",
  visitor: "var(--color-concrete)",
};

/** Right manifest stack — layered shipping manifests, not cards. */
export function ManifestStackPanel({ onOpenRegistry }: { onOpenRegistry: () => void }) {
  const { network, address, role, bounty, submissions, verdict, setRole } = useCargoStore();
  const revealed = submissions.filter((s) => s.eligible).length;
  const winner = submissions.find((s) => s.status === "winner");

  return (
    <aside className="flex h-full flex-col gap-2.5">
      {/* manifest sheet 1 — access */}
      <div className="panel rounded-md p-4">
        <ManifestHeader title="Access Manifest" />
        <Row label="Network">
          <RitualNetworkBadge status={network} />
        </Row>
        <Row label="Operator">
          <span className="font-mono text-[13px] text-[var(--color-paper)]/85">{shortAddress(address)}</span>
        </Row>
        <Row label="Role">
          <div className="flex gap-1">
            {(["owner", "participant", "visitor"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-colors"
                style={{
                  color: role === r ? ROLE_COLOR[r] : "rgba(243,237,225,0.4)",
                  background: role === r ? `color-mix(in srgb, ${ROLE_COLOR[r]} 16%, transparent)` : "transparent",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </Row>
      </div>

      {/* manifest sheet 2 — bounty */}
      <div className="panel rounded-md p-4">
        <ManifestHeader title="Bounty Manifest" />
        {bounty ? (
          <>
            <Row label="Bounty ID">
              <Badge color="var(--color-bullion)">#{bounty.id.toString()}</Badge>
            </Row>
            <Row label="Owner">
              <span className="font-mono text-[13px] text-[var(--color-paper)]/85">{shortAddress(bounty.owner)}</span>
            </Row>
            <Row label="Reward">
              <span className="text-[14px] font-bold text-[var(--color-bullion)]">
                {formatReward(bounty.reward, bounty.rewardSymbol)}
              </span>
            </Row>
            <Row label="AI fuel">
              <Badge color={bounty.aiFunded ? "var(--color-ai)" : "var(--color-concrete)"}>
                {bounty.aiFunded ? "Powered" : "Not funded"}
              </Badge>
            </Row>
          </>
        ) : (
          <p className="py-2 text-[13px] text-[var(--color-paper)]/45">No bounty manifest yet.</p>
        )}
      </div>

      {/* manifest sheet 3 — counts */}
      <div className="panel rounded-md p-4">
        <ManifestHeader title="Cargo Counts" />
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={<Container size={15} />} label="Sealed" value={submissions.length} color="var(--color-sealed)" />
          <Stat icon={<Boxes size={15} />} label="Revealed" value={revealed} color="var(--color-teal)" />
          <Stat icon={<Cpu size={15} />} label="AI pick" value={verdict ? 1 : 0} color="var(--color-ai)" />
          <Stat icon={<Trophy size={15} />} label="Winner" value={winner ? 1 : 0} color="var(--color-bullion)" />
        </div>
      </div>

      {network === "connected" && <LoadManifestPanel />}

      {/* registry shortcut */}
      <button
        onClick={onOpenRegistry}
        className="panel mt-auto flex items-center justify-between rounded-md p-4 transition-colors hover:border-[var(--color-safety)]/40"
      >
        <span className="flex items-center gap-2.5">
          <Container size={18} className="text-[var(--color-safety)]" />
          <span className="text-[14px] font-bold uppercase tracking-wide text-[var(--color-paper)]">
            Cargo Registry
          </span>
        </span>
        <span className="text-[13px] text-[var(--color-paper)]/50">{submissions.length}</span>
      </button>
    </aside>
  );
}

function ManifestHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-dashed border-[var(--color-concrete)]/20 pb-2">
      <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-paper)]/55">
        {title}
      </span>
      <span className="h-2 w-2 rounded-full bg-[var(--color-safety)]/60" />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[13px] uppercase tracking-wide text-[var(--color-paper)]/45">{label}</span>
      {children}
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-sm border border-[var(--color-concrete)]/12 bg-black/25 p-2.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--color-paper)]/45" style={{ color }}>
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[20px] font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
