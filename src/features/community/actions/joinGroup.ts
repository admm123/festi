"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { NotificationType, Notifier } from "@/features/notification";
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
      name: true,
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

  await Notifier.push({
    type: NotificationType.GROUP_JOINED,
    userId: group.createdById,
    actorId: session.user.id,
    targetType: "Group",
    targetId: groupId,
    message: group.name,
  });

  return {
    success: true as const,
    message: "You joined the group.",
  };
}
