"use server";

import { getCurrentUser } from "@/features/auth";
import { FollowUserFormData, followUserFormSchema } from "../schemas";
import { prisma } from "@/lib/prisma";

export async function unfollowRider(values: FollowUserFormData) {
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
      message: "You cannot unfollow yourself.",
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

  if (!alreadyFollowing) {
    return { success: false, message: "You are not following this user." };
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetId,
      },
    },
  });
  return { success: true, message: "You are no longer following this user." };
}
