import type { NetworkStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

export function RitualNetworkBadge({ status }: { status: NetworkStatus }) {
  if (status === "connected") return <Badge color="var(--color-teal)" dot>Ritual Network</Badge>;
  if (status === "wrong-network") return <Badge color="var(--color-alarm)" dot>Wrong Network</Badge>;
  return <Badge color="var(--color-concrete)">Offline</Badge>;
}
