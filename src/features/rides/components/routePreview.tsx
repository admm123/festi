"use client";

import { useMemo } from "react";
import { decodeRouteGeometry } from "../lib/geometry";
import type { Waypoint } from "../types";
import { RideMap } from "./rideMap";

type RoutePreviewProps = {
  routeGeometry: string;
  waypoints: Waypoint[];
  className?: string;
};

/** Read-only map preview of a saved route. */
export function RoutePreview({
  routeGeometry,
  waypoints,
  className,
}: RoutePreviewProps) {
  const coordinates = useMemo(
    () => decodeRouteGeometry(routeGeometry),
    [routeGeometry],
  );

  return (
    <RideMap
      waypoints={waypoints}
      routeCoordinates={coordinates}
      className={className}
    />
  );
}
