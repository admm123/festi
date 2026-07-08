"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

export async function getGroups() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const groups = await prisma.group.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    image: group.image,
    createdAt: group.createdAt.toISOString(),
    memberCount: group.members.length,
    createdBy: group.createdBy,
    isOwner: group.createdById === session.user.id,
    isMember: group.members.some((member) => member.userId === session.user.id),
  }));
}
