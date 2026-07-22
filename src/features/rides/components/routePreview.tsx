"use client";

import { useMemo } from "react";
import { decodeRouteGeometry } from "../lib/geometry";
import type { MapDot, Waypoint } from "../types";
import { RideMap } from "./rideMap";

type RoutePreviewProps = {
  routeGeometry: string;
  waypoints: Waypoint[];
  highlight?: [number, number] | null;
  /** Points drawn on top of the route (e.g. live rider positions). */
  dots?: MapDot[];
  className?: string;
};

/** Read-only map preview of a saved route. */
export function RoutePreview({
  routeGeometry,
  waypoints,
  highlight,
  dots,
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
      highlight={highlight}
      dots={dots}
      className={className}
    />
  );
}
