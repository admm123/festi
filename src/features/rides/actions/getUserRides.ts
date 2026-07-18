"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { RideSummary, Waypoint } from "../types";

/** Returns a specific user's rides, newest first. */
export async function getUserRides(userId: string): Promise<RideSummary[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  if (!userId) return [];

  const rides = await prisma.ride.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: {
        select: { id: true, name: true, username: true, image: true },
      },
      participants: {
        where: { userId: session.user.id },
        select: { status: true },
      },
      _count: {
        select: {
          participants: { where: { status: "APPROVED" } },
          photos: true,
        },
      },
    },
  });

  return rides.map((ride) => ({
    id: ride.id,
    title: ride.title,
    description: ride.description,
    startLocation: ride.startLocation,
    startTime: ride.startTime.toISOString(),
    distance: ride.distance,
    duration: ride.duration,
    elevationGain: ride.elevationGain,
    elevationLoss: ride.elevationLoss,
    routeGeometry: ride.routeGeometry,
    waypoints: ride.waypoints as unknown as Waypoint[],
    status: ride.status,
    pace: (ride.pace ?? null) as RideSummary["pace"],
    difficulty: (ride.difficulty ?? null) as RideSummary["difficulty"],
    maxParticipants: ride.maxParticipants,
    recurrenceId: ride.recurrenceId,
    createdAt: ride.createdAt.toISOString(),
    creator: ride.creator,
    participantCount: ride._count.participants,
    isCreator: ride.creatorId === session.user.id,
    participantStatus: ride.participants[0]?.status ?? null,
    photoCount: ride._count.photos,
  }));
}
