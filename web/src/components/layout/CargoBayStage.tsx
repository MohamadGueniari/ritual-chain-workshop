import { AnimatePresence } from "framer-motion";
import { useCargoStore } from "@/store/useCargoStore";
import { DockStage } from "@/components/stages/DockStage";
import { ManifestStage } from "@/components/stages/ManifestStage";
import { PhaseStage } from "@/components/stages/PhaseStage";
import { SealStage } from "@/components/stages/SealStage";
import { RevealStage } from "@/components/stages/RevealStage";
import { FuelStage } from "@/components/stages/FuelStage";
import { InspectionStage } from "@/components/stages/InspectionStage";
import { ReportStage } from "@/components/stages/ReportStage";
import { ReleaseStage } from "@/components/stages/ReleaseStage";
import { RegistryStage } from "@/components/stages/RegistryStage";
import type { StageId } from "@/types";

const SCENES: Record<StageId, React.ComponentType> = {
  dock: DockStage,
  manifest: ManifestStage,
  phase: PhaseStage,
  seal: SealStage,
  reveal: RevealStage,
  fuel: FuelStage,
  inspection: InspectionStage,
  report: ReportStage,
  release: ReleaseStage,
  registry: RegistryStage,
};

/** Center cargo bay — the active stage scene, with a transition each change. */
export function CargoBayStage() {
  const { activeStage } = useCargoStore();
  const Scene = SCENES[activeStage];
  return (
    <section className="panel rivets relative min-h-[560px] overflow-hidden rounded-lg p-6 sm:p-8">
      <AnimatePresence mode="wait">
        <Scene key={activeStage} />
      </AnimatePresence>
    </section>
  );
}
