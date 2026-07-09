"use server";

import { getCurrentUser } from "@/features/auth";
import { FollowUserFormData, followUserFormSchema } from "../schemas";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";

export async function followRider(values: FollowUserFormData) {
  const validatedData = followUserFormSchema.safeParse(values);
  if (!validatedData.success) {
    return { success: false, message: "Invalid form data." };
  }

  const session = await getCurrentUser();
  if (!session) {
    return { success: false, message: "You must be signed in." };
  }

  const { targetId } = validatedData.data;

  if (session.user.id === targetId) {
    return {
      success: false,
      message: "You cannot follow yourself.",
    };
  }

  const alreadyFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetId,
      },
    },
  });

  if (alreadyFollowing) {
    return { success: false, message: "You are already following this user." };
  }

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: targetId,
    },
  });

  await Logger.log(
    ActivityAction.USER_FOLLOWED,
    `${session.user.email} followed another user.`,
    {
      actorId: session.user.id,
      targetUserId: targetId,
    },
  );

  return { success: true, message: "You are now following this user." };
}
