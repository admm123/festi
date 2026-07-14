"use client";

import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Waypoint } from "../types";

type WaypointListProps = {
  waypoints: Waypoint[];
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
};

function waypointLabel(index: number, total: number): string {
  if (index === 0) return "Start";
  if (index === total - 1) return "End";
  return `Stop ${index}`;
}

export function WaypointList({
  waypoints,
  onRemove,
  onMove,
}: WaypointListProps) {
  if (waypoints.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        Click on the map to add your first point.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {waypoints.map((waypoint, index) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: waypoints have no stable id
          key={index}
          className="flex items-center gap-2 rounded-lg border bg-card p-2"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {waypointLabel(index, waypoints.length)}
            </p>
            <p className="truncate text-xs text-muted-foreground tabular-nums">
              {waypoint.lat.toFixed(5)}, {waypoint.lng.toFixed(5)}
            </p>
          </div>
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
              aria-label="Move up"
            >
              <ChevronUpIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === waypoints.length - 1}
              onClick={() => onMove(index, 1)}
              aria-label="Move down"
            >
              <ChevronDownIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              aria-label="Remove point"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
