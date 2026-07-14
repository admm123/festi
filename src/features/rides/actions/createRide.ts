"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { prisma } from "@/lib/prisma";
import { fetchRoute } from "../lib/brouter";
import { createRideSchema } from "../schemas";

type CreateRideResult =
  | { success: true; message: string; rideId: string }
  | { success: false; error: string };

/**
 * Persists a new ride. The route is recomputed on the server from the raw
 * waypoints so the stored distance/duration/elevation cannot be tampered with
 * by the client.
 */
export async function createRide(input: unknown): Promise<CreateRideResult> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = createRideSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid ride data.",
    };
  }

  const { title, description, startTime, waypoints, profile } = parsed.data;

  let route: Awaited<ReturnType<typeof fetchRoute>>;
  try {
    route = await fetchRoute(waypoints, profile);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not calculate the route.",
    };
  }

  const ride = await prisma.ride.create({
    data: {
      creatorId: session.user.id,
      title,
      description: description ? description : null,
      startTime,
      distance: route.distance,
      duration: route.duration,
      elevationGain: route.elevationGain,
      elevationLoss: route.elevationLoss,
      routeGeometry: route.routeGeometry,
      waypoints,
    },
  });

  revalidatePath("/dashboard/community-rides");

  await Logger.log(
    ActivityAction.RIDE_CREATED,
    `${session.user.email} created the ride "${ride.title}".`,
    {
      actorId: session.user.id,
      targetType: "Ride",
      targetId: ride.id,
      metadata: {
        title: ride.title,
        distance: ride.distance,
        elevationGain: ride.elevationGain,
      },
    },
  );

  return {
    success: true,
    message: `${ride.title} has been created.`,
    rideId: ride.id,
  };
}
