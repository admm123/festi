import polyline from "@mapbox/polyline";
import type { RouteProfile, RouteResult, Waypoint } from "../types";

/**
 * BRouter GeoJSON response shape (only the fields we rely on).
 * @see https://github.com/abrensch/brouter
 */
type BRouterResponse = {
  features?: Array<{
    geometry?: {
      type?: string;
      coordinates?: number[][];
    };
    properties?: {
      "track-length"?: string;
      "total-time"?: string;
      "filtered ascend"?: string;
      "plain-ascend"?: string;
    };
  }>;
};

/** Maps our internal profile names to BRouter profile identifiers. */
const BROUTER_PROFILES: Record<RouteProfile, string> = {
  trekking: "trekking",
  fastbike: "fastbike",
  gravel: "gravel",
};

function getBRouterBaseUrl(): string {
  return process.env.BROUTER_URL?.replace(/\/$/, "") ?? "https://brouter.de";
}

/**
 * Computes total ascent and descent (in meters) from an ordered list of
 * `[lng, lat, elevation]` coordinates.
 */
function computeElevation(coordinates: number[][]): {
  gain: number;
  loss: number;
} {
  let gain = 0;
  let loss = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1][2];
    const curr = coordinates[i][2];

    if (typeof prev !== "number" || typeof curr !== "number") {
      continue;
    }

    const delta = curr - prev;
    if (delta > 0) {
      gain += delta;
    } else {
      loss += -delta;
    }
  }

  return { gain: Math.round(gain), loss: Math.round(loss) };
}

/**
 * Requests a cycling route between the given waypoints from BRouter and returns
 * normalized route statistics plus an encoded polyline for storage.
 *
 * Throws an `Error` with a user-safe message when the route cannot be built.
 */
export async function fetchRoute(
  waypoints: Waypoint[],
  profile: RouteProfile,
): Promise<RouteResult> {
  if (waypoints.length < 2) {
    throw new Error("Add at least two points to build a route.");
  }

  const lonlats = waypoints
    .map((point) => `${point.lng},${point.lat}`)
    .join("|");

  const params = new URLSearchParams({
    lonlats,
    profile: BROUTER_PROFILES[profile] ?? "trekking",
    alternativeidx: "0",
    format: "geojson",
  });

  const url = `${getBRouterBaseUrl()}/brouter?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the routing service. Please try again.");
  }

  if (!response.ok) {
    // BRouter returns a plain-text error body for unroutable requests.
    const message = await response.text().catch(() => "");
    throw new Error(
      message.trim() ||
        "No cycling route could be found between the selected points.",
    );
  }

  const data = (await response.json()) as BRouterResponse;
  const feature = data.features?.[0];
  const coordinates = feature?.geometry?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    throw new Error(
      "No cycling route could be found between the selected points.",
    );
  }

  const props = feature?.properties ?? {};
  const distance = Number.parseFloat(props["track-length"] ?? "0");
  const duration = Number.parseInt(props["total-time"] ?? "0", 10);
  const { gain, loss } = computeElevation(coordinates);

  // Encode as a polyline of [lat, lng] pairs; `coordinates` are [lng, lat, ele].
  const routeGeometry = polyline.encode(
    coordinates.map(([lng, lat]) => [lat, lng]),
  );

  return {
    distance: Number.isFinite(distance) ? distance : 0,
    duration: Number.isFinite(duration) ? duration : 0,
    elevationGain: gain,
    elevationLoss: loss,
    routeGeometry,
    coordinates: coordinates.map(([lng, lat]) => [lng, lat]),
  };
}
