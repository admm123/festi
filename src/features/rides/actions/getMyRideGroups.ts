"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

export type RideGroupOption = {
  id: string;
  name: string;
};

/**
 * Returns the groups the current user is an approved member of, for the
 * "Post to a group" picker in the ride planner.
 */
export async function getMyRideGroups(): Promise<RideGroupOption[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id, status: "APPROVED" },
    orderBy: { group: { name: "asc" } },
    select: { group: { select: { id: true, name: true } } },
  });

  return memberships.map((membership) => membership.group);
}
