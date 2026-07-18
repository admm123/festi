"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { RouteSummary } from "../types";

/**
 * Returns a group's shared route library. Approved members only.
 */
export async function getGroupRoutes(groupId: string): Promise<RouteSummary[]> {
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

  const routes = await prisma.route.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: { select: { id: true, name: true, username: true } },
    },
  });

  return routes.map((route) => ({
    id: route.id,
    name: route.name,
    description: route.description,
    distance: route.distance,
    duration: route.duration,
    elevationGain: route.elevationGain,
    elevationLoss: route.elevationLoss,
    createdAt: route.createdAt.toISOString(),
    createdBy: route.creator,
    isOwner: route.creatorId === session.user.id,
  }));
}
