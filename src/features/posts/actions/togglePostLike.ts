"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

type Result =
  | { success: true; liked: boolean; likeCount: number }
  | { success: false; error: string };

/** Toggles the current user's like on a post. */
export async function togglePostLike(postId: string): Promise<Result> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  if (!postId) {
    return { success: false, error: "Missing post." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return { success: false, error: "Post not found." };
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
    select: { id: true },
  });

  let liked: boolean;
  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await prisma.postLike.create({
      data: { postId, userId: session.user.id },
    });
    liked = true;
  }

  const likeCount = await prisma.postLike.count({ where: { postId } });

  return { success: true, liked, likeCount };
}
