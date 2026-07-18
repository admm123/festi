"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { RideSummary, Waypoint } from "../types";

/**
 * Returns the upcoming scheduled rides posted to a group, ordered by start
 * time. Only approved members of the group may read them — everyone else gets
 * an error, so group rides never leak to non-members here.
 */
export async function getGroupRides(groupId: string): Promise<RideSummary[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId: session.user.id, status: "APPROVED" },
    select: { id: true },
  });
  if (!membership) {
    throw new Error("You must be a member of this group.");
  }

  const rides = await prisma.ride.findMany({
    where: {
      groupId,
      status: "SCHEDULED",
      startTime: { gte: new Date() },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 12,
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
