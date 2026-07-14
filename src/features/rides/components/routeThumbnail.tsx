"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { decodeRouteGeometry } from "../lib/geometry";

type RouteThumbnailProps = {
  routeGeometry: string;
  className?: string;
};

const WIDTH = 320;
const HEIGHT = 160;
const PADDING = 12;

/**
 * Lightweight SVG preview of a route shape. Unlike a full map it uses no WebGL
 * context or tile requests, so it scales to many cards in a grid.
 */
export function RouteThumbnail({
  routeGeometry,
  className,
}: RouteThumbnailProps) {
  const path = useMemo(() => {
    const coords = decodeRouteGeometry(routeGeometry);
    if (coords.length < 2) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Web-Mercator-ish projection is unnecessary at this scale; use raw lng/lat
    // and correct for latitude so the shape isn't horizontally stretched.
    const latRad = (coords[0][1] * Math.PI) / 180;
    const lngScale = Math.cos(latRad);

    const projected = coords.map(([lng, lat]) => {
      const x = lng * lngScale;
      const y = -lat;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      return [x, y] as const;
    });

    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const scale = Math.min(
      (WIDTH - PADDING * 2) / spanX,
      (HEIGHT - PADDING * 2) / spanY,
    );
    const offsetX = (WIDTH - spanX * scale) / 2;
    const offsetY = (HEIGHT - spanY * scale) / 2;

    return projected
      .map(([x, y], index) => {
        const px = offsetX + (x - minX) * scale;
        const py = offsetY + (y - minY) * scale;
        return `${index === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(" ");
  }, [routeGeometry]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn("h-full w-full bg-muted/40", className)}
      role="img"
      aria-label="Route preview"
      preserveAspectRatio="xMidYMid meet"
    >
      {path && (
        <path
          d={path}
          fill="none"
          stroke="#ef4444"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
