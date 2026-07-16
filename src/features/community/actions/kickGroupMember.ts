"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { prisma } from "@/lib/prisma";

export async function kickGroupMember(input: {
  groupId: string;
  memberId: string;
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false as const, error: "You must be signed in." };
  }

  const group = await prisma.group.findUnique({
    where: { id: input.groupId },
    select: {
      createdById: true,
    },
  });

  if (!group) {
    return { success: false as const, error: "Group not found." };
  }

  if (group.createdById !== session.user.id) {
    return {
      success: false as const,
      error: "Only the group owner can kick members.",
    };
  }

  const member = await prisma.groupMember.findUnique({
    where: { id: input.memberId },
    select: {
      userId: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!member) {
    return { success: false as const, error: "Member not found." };
  }

  if (member.userId === group.createdById) {
    return {
      success: false as const,
      error: "You cannot kick the group owner.",
    };
  }

  await prisma.groupMember.delete({
    where: {
      id: input.memberId,
    },
  });

  revalidatePath(`/groups/${input.groupId}`);

  await Logger.log(
    ActivityAction.GROUP_MEMBER_REMOVED,
    `${session.user.email} kicked ${member.user.name} from a group.`,
    {
      actorId: session.user.id,
      targetUserId: member.userId,
      targetType: "Group",
      targetId: input.groupId,
    },
  );

  return {
    success: true as const,
    message: `${member.user.name} has been kicked from the group.`,
  };
}
