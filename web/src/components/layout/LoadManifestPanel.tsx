import { useState } from "react";
import { Search } from "lucide-react";
import { useCargoStore } from "@/store/useCargoStore";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

/** Load any existing manifest by id — so shippers/visitors can join a job. */
export function LoadManifestPanel() {
  const { loadBounty, busy } = useCargoStore();
  const [id, setId] = useState("");

  async function load() {
    const n = id.trim();
    if (!/^\d+$/.test(n)) return;
    await loadBounty(BigInt(n));
  }

  return (
    <div className="panel rounded-md p-4">
      <div className="mb-2 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-paper)]/45">
        Open existing manifest
      </div>
      <div className="flex gap-2">
        <Input
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load()}
          inputMode="numeric"
          placeholder="manifest id, e.g. 1"
          className="flex-1"
        />
        <Button variant="teal" size="md" onClick={load} disabled={busy || !id.trim()}>
          <Search size={16} />
        </Button>
      </div>
    </div>
  );
}
