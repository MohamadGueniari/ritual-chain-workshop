import { useEffect, useState } from "react";
import { ToasterProvider } from "@/components/feedback/Toaster";
import { TopBar } from "@/components/layout/TopBar";
import { CargoRouteRail } from "@/components/layout/CargoRouteRail";
import { CargoBayStage } from "@/components/layout/CargoBayStage";
import { ManifestStackPanel } from "@/components/layout/ManifestStackPanel";
import { ConveyorEventLog } from "@/components/layout/ConveyorEventLog";
import { CargoRegistryDrawer } from "@/components/layout/CargoRegistryDrawer";
import { PhaseCountdownBar } from "@/components/layout/PhaseCountdownBar";
import { HelpModal } from "@/components/modals/HelpModal";
import { useCargoStore } from "@/store/useCargoStore";

function Shell() {
  const [help, setHelp] = useState(false);
  const [registry, setRegistry] = useState(false);
  const tick = useCargoStore((s) => s.tick);
  const bounty = useCargoStore((s) => s.bounty);

  // Drive phase boundaries + auto-transition (1s cadence; Ritual deadlines are ms).
  useEffect(() => {
    if (!bounty) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [bounty, tick]);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* steel readability veil on top of the host background (never replaces it) */}
      <div className="cargo-backdrop" />

      <div className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <TopBar onHelp={() => setHelp(true)} />
      </div>

      <div className="mx-auto w-full max-w-[1700px] px-3 pt-3 sm:px-4">
        <PhaseCountdownBar />
      </div>

      {/* unique skeleton: left route rail · center bay · right manifest stack */}
      <main className="mx-auto grid w-full max-w-[1700px] flex-1 grid-cols-1 gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
        <div className="order-2 lg:order-1 lg:sticky lg:top-[92px] lg:max-h-[calc(100vh-180px)] lg:overflow-hidden">
          <CargoRouteRail />
        </div>
        <div className="order-1 lg:order-2">
          <CargoBayStage />
        </div>
        <div className="order-3 lg:sticky lg:top-[92px] lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:overscroll-contain thin-scroll">
          <ManifestStackPanel onOpenRegistry={() => setRegistry(true)} />
        </div>
      </main>

      <div className="sticky bottom-0 z-30 px-3 pb-3 sm:px-4">
        <ConveyorEventLog />
      </div>

      <CargoRegistryDrawer open={registry} onOpenChange={setRegistry} />
      <HelpModal open={help} onOpenChange={setHelp} />
    </div>
  );
}

export default function App() {
  return (
    <ToasterProvider>
      <Shell />
    </ToasterProvider>
  );
}
