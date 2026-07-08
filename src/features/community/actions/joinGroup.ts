"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

export async function joinGroup(groupId: string) {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false as const, error: "You must be signed in." };
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      createdById: true,
    },
  });

  if (!group) {
    return { success: false as const, error: "Group not found." };
  }

  if (group.createdById === session.user.id) {
    return {
      success: false as const,
      error: "You cannot join your own group.",
    };
  }

  await prisma.groupMember.create({
    data: {
      groupId,
      userId: session.user.id,
      role: "member",
    },
  });

  revalidatePath(`/groups/${groupId}`);

  return {
    success: true as const,
    message: "You joined the group.",
  };
}
