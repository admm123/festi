"use server";

import { prisma } from "@/lib/prisma";
import type { RideDifficulty, RidePace } from "../types";

/** Public, privacy-limited view of a ride (no participant identities). */
export type PublicRide = {
  id: string;
  title: string;
  description: string | null;
  startLocation: string | null;
  startTime: string;
  distance: number;
  duration: number;
  elevationGain: number;
  elevationLoss: number;
  routeGeometry: string;
  status: "SCHEDULED" | "CANCELLED";
  pace: RidePace | null;
  difficulty: RideDifficulty | null;
  maxParticipants: number | null;
  participantCount: number;
  creatorName: string;
};

/**
 * Returns the public view of a ride for logged-out visitors, or null when the
 * ride does not exist or the creator has disabled the public link. Deliberately
 * exposes no user ids and no participant data.
 */
export async function getPublicRide(
  rideId: string,
): Promise<PublicRide | null> {
  const ride = await prisma.ride.findFirst({
    where: { id: rideId, isPublic: true },
    select: {
      id: true,
      title: true,
      description: true,
      startLocation: true,
      startTime: true,
      distance: true,
      duration: true,
      elevationGain: true,
      elevationLoss: true,
      routeGeometry: true,
      status: true,
      pace: true,
      difficulty: true,
      maxParticipants: true,
      creator: { select: { name: true } },
      _count: {
        select: { participants: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!ride) {
    return null;
  }

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
    status: ride.status,
    pace: (ride.pace ?? null) as PublicRide["pace"],
    difficulty: (ride.difficulty ?? null) as PublicRide["difficulty"],
    maxParticipants: ride.maxParticipants,
    participantCount: ride._count.participants,
    creatorName: ride.creator.name,
  };
}
