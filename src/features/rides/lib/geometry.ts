import polyline from "@mapbox/polyline";

/**
 * Decodes a stored polyline into `[lng, lat]` pairs for map rendering.
 * Client-safe: contains no server-only dependencies.
 */
export function decodeRouteGeometry(geometry: string): [number, number][] {
  return polyline.decode(geometry).map(([lat, lng]) => [lng, lat]);
}
