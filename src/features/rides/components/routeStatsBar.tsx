import {
  ArrowDownRightIcon,
  ClockIcon,
  MountainIcon,
  RouteIcon,
} from "lucide-react";
import { formatDistance, formatDuration, formatElevation } from "../lib/format";
import type { RouteResult } from "../types";

type RouteStatsBarProps = {
  route: RouteResult | null;
};

/** Compact stats row designed to float over the map. */
export function RouteStatsBar({ route }: RouteStatsBarProps) {
  const stats = [
    {
      key: "distance",
      icon: RouteIcon,
      value: route ? formatDistance(route.distance) : "–",
    },
    {
      key: "duration",
      icon: ClockIcon,
      value: route ? formatDuration(route.duration) : "–",
    },
    {
      key: "gain",
      icon: MountainIcon,
      value: route ? formatElevation(route.elevationGain) : "–",
    },
    {
      key: "loss",
      icon: ArrowDownRightIcon,
      value: route ? formatElevation(route.elevationLoss) : "–",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="flex items-center gap-1.5 rounded-lg bg-background/80 px-3 py-1.5 text-sm shadow-sm ring-1 ring-foreground/10 backdrop-blur"
        >
          <stat.icon className="size-3.5 text-muted-foreground" />
          <span className="font-semibold tabular-nums">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
