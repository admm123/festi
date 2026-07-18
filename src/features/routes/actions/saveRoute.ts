"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { prisma } from "@/lib/prisma";
import { saveRouteSchema } from "../schemas";

type SaveRouteResult =
  | { success: true; message: string; routeId: string }
  | { success: false; error: string };

/**
 * Saves a ride's route into the route library — personally, or into a group's
 * shared library. Mirrors the GPX access rule: the ride creator and approved
 * participants may save the route.
 */
export async function saveRoute(input: unknown): Promise<SaveRouteResult> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = saveRouteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid route data.",
    };
  }

  const { rideId, name, description, groupId } = parsed.data;

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: {
      id: true,
      creatorId: true,
      distance: true,
      duration: true,
      elevationGain: true,
      elevationLoss: true,
      routeGeometry: true,
      waypoints: true,
      elevationProfile: true,
      participants: {
        where: { userId: session.user.id, status: "APPROVED" },
        select: { id: true },
      },
    },
  });

  if (!ride) {
    return { success: false, error: "Ride not found." };
  }

  const canSave =
    ride.creatorId === session.user.id || ride.participants.length > 0;
  if (!canSave) {
    return {
      success: false,
      error: "Only the creator and approved riders can save this route.",
    };
  }

  if (groupId) {
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: session.user.id, status: "APPROVED" },
      select: { id: true },
    });
    if (!membership) {
      return {
        success: false,
        error: "You must be a member of that group to add routes to it.",
      };
    }
  }

  const route = await prisma.route.create({
    data: {
      creatorId: session.user.id,
      groupId: groupId ?? null,
      name,
      description: description ? description : null,
      distance: ride.distance,
      duration: ride.duration,
      elevationGain: ride.elevationGain,
      elevationLoss: ride.elevationLoss,
      routeGeometry: ride.routeGeometry,
      waypoints: ride.waypoints ?? [],
      elevationProfile: ride.elevationProfile ?? undefined,
    },
  });

  await Logger.log(
    ActivityAction.ROUTE_SAVED,
    `${session.user.email} saved the route "${name}".`,
    {
      actorId: session.user.id,
      targetType: groupId ? "Group" : "Route",
      targetId: groupId ?? route.id,
      metadata: { routeId: route.id, sourceRideId: rideId, groupId },
    },
  );

  return {
    success: true,
    message: `Route "${name}" saved${groupId ? " to the group library" : " to your library"}.`,
    routeId: route.id,
  };
}
