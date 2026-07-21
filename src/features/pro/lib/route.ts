import polyline from "@mapbox/polyline";
import type { GpxPoint, GpxRoute } from "procycling-live/gpx";
import type { ElevationPoint, Waypoint } from "@/features/rides/types";
import type { ProStageRoute } from "../types";

/** Cap for the encoded map geometry; keeps the action payload small. */
const MAX_GEOMETRY_POINTS = 800;
/** Cap for the elevation chart, matching the rides feature's profile size. */
const MAX_PROFILE_POINTS = 200;

/** Picks evenly spaced points, always keeping the first and the last. */
function downsample<T>(points: T[], max: number): T[] {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const sampled = points.filter((_, index) => index % step === 0);
  const last = points[points.length - 1];
  if (last !== undefined && sampled[sampled.length - 1] !== last) {
    sampled.push(last);
  }
  return sampled;
}

/**
 * Turns a parsed GPX route into the serializable payload the stage map and
 * elevation chart consume: an encoded polyline (same format the rides feature
 * stores), start/finish waypoints, and a downsampled elevation profile.
 */
export function buildStageRoute(
  route: GpxRoute,
  sourceUrl: string | null,
): ProStageRoute {
  const geometryPoints = downsample(route.points, MAX_GEOMETRY_POINTS);
  const routeGeometry = polyline.encode(
    geometryPoints.map((point) => [point.lat, point.lon]),
  );

  const first = route.points[0];
  const last = route.points[route.points.length - 1];
  const waypoints: Waypoint[] = [];
  if (first) waypoints.push({ lat: first.lat, lng: first.lon });
  if (last && last !== first) waypoints.push({ lat: last.lat, lng: last.lon });

  const withElevation = route.points.filter(
    (point): point is GpxPoint & { ele: number; dist: number } =>
      point.ele !== undefined && point.dist !== undefined,
  );
  const elevationProfile: ElevationPoint[] = downsample(
    withElevation,
    MAX_PROFILE_POINTS,
  ).map((point) => ({
    distance: Number((point.dist / 1000).toFixed(2)),
    elevation: Math.round(point.ele),
    lat: point.lat,
    lng: point.lon,
  }));

  return {
    routeGeometry,
    waypoints,
    elevationProfile,
    distanceMeters: Math.round(route.distanceMeters),
    elevationGain: route.elevationGain,
    elevationLoss: route.elevationLoss,
    minEle: route.minEle ?? null,
    maxEle: route.maxEle ?? null,
    sourceUrl,
  };
}
