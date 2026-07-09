"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";

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

  await Logger.log(
    ActivityAction.GROUP_JOINED,
    `${session.user.email} joined a group.`,
    {
      actorId: session.user.id,
      targetType: "Group",
      targetId: groupId,
    },
  );

  return {
    success: true as const,
    message: "You joined the group.",
  };
}
