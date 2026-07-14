"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { RideSummary, Waypoint } from "../types";

/**
 * Returns upcoming rides (starting now or later) ordered by start time, with
 * the approved participant count and the current user's join status.
 */
export async function getRides(): Promise<RideSummary[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const rides = await prisma.ride.findMany({
    where: {
      startTime: { gte: new Date() },
    },
    orderBy: {
      startTime: "asc",
    },
    include: {
      creator: {
        select: { id: true, name: true, username: true, image: true },
      },
      participants: {
        where: { userId: session.user.id },
        select: { status: true },
      },
      _count: {
        select: { participants: { where: { status: "APPROVED" } } },
      },
    },
  });

  return rides.map((ride) => ({
    id: ride.id,
    title: ride.title,
    description: ride.description,
    startTime: ride.startTime.toISOString(),
    distance: ride.distance,
    duration: ride.duration,
    elevationGain: ride.elevationGain,
    elevationLoss: ride.elevationLoss,
    routeGeometry: ride.routeGeometry,
    waypoints: ride.waypoints as unknown as Waypoint[],
    createdAt: ride.createdAt.toISOString(),
    creator: ride.creator,
    participantCount: ride._count.participants,
    isCreator: ride.creatorId === session.user.id,
    participantStatus: ride.participants[0]?.status ?? null,
  }));
}
