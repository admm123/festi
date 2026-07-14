import {
  ArrowDownRightIcon,
  ClockIcon,
  MountainIcon,
  RouteIcon,
} from "lucide-react";
import { formatDistance, formatDuration, formatElevation } from "../lib/format";
import type { RouteResult } from "../types";

type RouteStatsPanelProps = {
  route: RouteResult | null;
};

export function RouteStatsPanel({ route }: RouteStatsPanelProps) {
  const stats = [
    {
      icon: RouteIcon,
      label: "Distance",
      value: route ? formatDistance(route.distance) : "–",
    },
    {
      icon: ClockIcon,
      label: "Duration",
      value: route ? formatDuration(route.duration) : "–",
    },
    {
      icon: MountainIcon,
      label: "Elevation gain",
      value: route ? formatElevation(route.elevationGain) : "–",
    },
    {
      icon: ArrowDownRightIcon,
      label: "Elevation loss",
      value: route ? formatElevation(route.elevationLoss) : "–",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <stat.icon className="size-3.5" />
            {stat.label}
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
