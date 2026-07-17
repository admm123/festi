"use client";

import { useState } from "react";
import type { ElevationPoint, Waypoint } from "../types";
import { ElevationChart } from "./elevationChart";
import { RoutePreview } from "./routePreview";

type RideRoutePanelProps = {
  routeGeometry: string;
  waypoints: Waypoint[];
  elevationProfile: ElevationPoint[];
};

/**
 * Map preview plus elevation graph, sharing hover state so pointing at the
 * elevation profile highlights the matching spot on the map.
 */
export function RideRoutePanel({
  routeGeometry,
  waypoints,
  elevationProfile,
}: RideRoutePanelProps) {
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
