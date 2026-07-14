"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { RideDetail, Waypoint } from "../types";

/**
 * Returns a single ride with its participants. The creator sees every
 * participant (including pending requests); other users see only approved
 * riders plus their own request.
 */
export async function getRide(rideId: string): Promise<RideDetail | null> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      creator: {
        select: { id: true, name: true, username: true, image: true },
      },
      participants: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
      },
    },
  });

  if (!ride) {
    return null;
  }

  const isCreator = ride.creatorId === session.user.id;

  const visibleParticipants = ride.participants.filter(
    (participant) =>
      isCreator ||
      participant.status === "APPROVED" ||
      participant.userId === session.user.id,
  );

  const ownParticipation = ride.participants.find(
    (participant) => participant.userId === session.user.id,
  );

  return {
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
    createdAt: ride.createdAt.toISOString(),
    creator: ride.creator,
    participantCount: ride.participants.filter((p) => p.status === "APPROVED")
      .length,
    isCreator,
    participantStatus: ownParticipation?.status ?? null,
    participants: visibleParticipants.map((participant) => ({
      id: participant.id,
      status: participant.status,
      createdAt: participant.createdAt.toISOString(),
      user: participant.user,
    })),
  };
}
