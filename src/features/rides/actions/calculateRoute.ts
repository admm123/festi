"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { fetchRoute } from "../lib/brouter";
import { calculateRouteSchema } from "../schemas";
import type { RouteResult } from "../types";

type CalculateRouteResult =
  | { success: true; route: RouteResult }
  | { success: false; error: string };

/**
 * Builds a cycling route between the selected waypoints via BRouter and returns
 * the geometry plus distance/duration/elevation statistics for the map.
 */
export async function calculateRoute(
  input: unknown,
): Promise<CalculateRouteResult> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = calculateRouteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid route data.",
    };
  }

  try {
    const route = await fetchRoute(parsed.data.waypoints, parsed.data.profile);
    return { success: true, route };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not calculate the route.",
    };
  }
}
