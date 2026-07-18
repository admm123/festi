"use server";

import { getCurrentUser } from "@/features/auth/guards";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { type RideFiltersInput, rideFiltersSchema } from "../schemas";
import type { RideSummary, Waypoint } from "../types";

/**
 * Returns scheduled rides ordered by start time, with the approved
 * participant count and the current user's join status. Cancelled rides are
 * hidden. Accepts optional discovery filters: case-insensitive search over
 * title/start location, exact pace/difficulty match, and `includePast` to
 * also return rides that already started (default: upcoming only).
 */
export async function getRides(input?: unknown): Promise<RideSummary[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const parsed = rideFiltersSchema.safeParse(input ?? {});
  const filters: RideFiltersInput = parsed.success ? parsed.data : {};

  const where: Prisma.RideWhereInput = {
    status: "SCHEDULED",
    ...(filters.includePast ? {} : { startTime: { gte: new Date() } }),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            {
              startLocation: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(filters.pace ? { pace: filters.pace } : {}),
    ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
  };

  const rides = await prisma.ride.findMany({
    where,
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
