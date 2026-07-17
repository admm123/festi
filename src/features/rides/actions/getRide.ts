"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import { fetchRoute } from "../lib/brouter";
import type { ElevationPoint, RideDetail, Waypoint } from "../types";

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
      photos: {
        orderBy: { position: "asc" },
        select: { id: true, url: true, position: true },
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

  const waypoints = ride.waypoints as unknown as Waypoint[];

  // Prefer the profile stored at creation (positions match the saved route).
  // Fall back to recomputing from waypoints for older rides that lack it.
  let elevationProfile: ElevationPoint[] = [];
  const stored = ride.elevationProfile as unknown as ElevationPoint[] | null;
  if (Array.isArray(stored) && stored.length >= 2) {
    elevationProfile = stored;
  } else {
    try {
      if (waypoints.length >= 2) {
        const route = await fetchRoute(waypoints, "trekking");
        elevationProfile = route.elevationProfile;
      }
    } catch {
      elevationProfile = [];
    }
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
    waypoints,
    createdAt: ride.createdAt.toISOString(),
    creator: ride.creator,
    participantCount: ride.participants.filter((p) => p.status === "APPROVED")
      .length,
    isCreator,
    participantStatus: ownParticipation?.status ?? null,
    photoCount: ride.photos.length,
    photos: ride.photos,
    elevationProfile,
    participants: visibleParticipants.map((participant) => ({
      id: participant.id,
      status: participant.status,
      createdAt: participant.createdAt.toISOString(),
      user: participant.user,
    })),
  };
}
