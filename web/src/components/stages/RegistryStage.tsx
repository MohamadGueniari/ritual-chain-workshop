import { useCargoStore } from "@/store/useCargoStore";
import { StageScaffold } from "./StageScaffold";
import { CargoContainerCard } from "@/components/cargo/CargoContainerCard";
import { Badge } from "@/components/ui/Badge";

/** Stage 9 — Cargo Registry. Every submission as a container card (no table). */
export function RegistryStage() {
  const { submissions } = useCargoStore();

  const counts = {
    sealed: submissions.filter((s) => s.status === "sealed" || s.status === "unrevealed").length,
    opened: submissions.filter((s) => s.eligible).length,
    winner: submissions.filter((s) => s.status === "winner").length,
  };

  return (
    <StageScaffold
      tag="Checkpoint 09"
      title="Cargo Registry"
      intro="Every container in the system. Sealed containers hide their contents; opened ones are readable; the winner glows gold."
      accent="var(--color-safety)"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge color="var(--color-sealed)">{counts.sealed} sealed</Badge>
        <Badge color="var(--color-teal)">{counts.opened} eligible</Badge>
        {counts.winner > 0 && <Badge color="var(--color-bullion)" dot>winner released</Badge>}
      </div>

      {submissions.length === 0 ? (
        <p className="text-[15px] text-[var(--color-paper)]/55">No cargo loaded yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {submissions.map((s) => (
            <CargoContainerCard key={s.index} submission={s} />
          ))}
        </div>
      )}
    </StageScaffold>
  );
}
