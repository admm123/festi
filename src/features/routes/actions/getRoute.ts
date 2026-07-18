"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { LibraryRoute, LibraryWaypoint } from "../types";

/**
 * Returns a single library route for planning a new ride from it. Accessible
 * to the route's creator and to approved members of its group.
 */
export async function getRoute(routeId: string): Promise<LibraryRoute | null> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      creator: { select: { id: true, name: true, username: true } },
    },
  });

  if (!route) {
    return null;
  }

  const isCreator = route.creatorId === session.user.id;
  let isGroupMember = false;
  if (route.groupId) {
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: route.groupId,
        userId: session.user.id,
        status: "APPROVED",
      },
      select: { id: true },
    });
    isGroupMember = !!membership;
  }

  if (!isCreator && !isGroupMember) {
    return null;
  }

  return {
    id: route.id,
    name: route.name,
    description: route.description,
    distance: route.distance,
    duration: route.duration,
    elevationGain: route.elevationGain,
    elevationLoss: route.elevationLoss,
    createdAt: route.createdAt.toISOString(),
    createdBy: route.creator,
    isOwner: isCreator,
    groupId: route.groupId,
    waypoints: route.waypoints as unknown as LibraryWaypoint[],
  };
}
