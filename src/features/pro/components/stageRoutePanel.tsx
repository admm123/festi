"use client";

import { useState } from "react";
import { ElevationChart } from "@/features/rides/components/elevationChart";
import { RoutePreview } from "@/features/rides/components/routePreview";
import type { ElevationPoint, Waypoint } from "@/features/rides/types";

type StageRoutePanelProps = {
  routeGeometry: string;
  waypoints: Waypoint[];
  elevationProfile: ElevationPoint[];
};

/**
 * Stage map plus elevation profile, sharing hover state so pointing at the
 * profile highlights the matching spot on the map — same wiring as the
 * rides feature's RideRoutePanel.
 */
export function StageRoutePanel({
  routeGeometry,
  waypoints,
  elevationProfile,
}: StageRoutePanelProps) {
  const [highlight, setHighlight] = useState<[number, number] | null>(null);

  return (
    <>
      <div className="h-[360px] w-full lg:h-[520px]">
        <RoutePreview
          routeGeometry={routeGeometry}
          waypoints={waypoints}
          highlight={highlight}
        />
      </div>
      {elevationProfile.length >= 2 && (
        <div className="border-t p-4">
          <ElevationChart
            data={elevationProfile}
            onHover={(point) =>
              setHighlight(point ? [point.lng, point.lat] : null)
            }
          />
        </div>
      )}
    </>
  );
}
