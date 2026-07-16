"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

type Result = { success: true } | { success: false; error: string };

/** Deletes a comment the current user authored. */
export async function deletePostComment(commentId: string): Promise<Result> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });

  if (!comment) {
    return { success: false, error: "Comment not found." };
  }

  if (comment.userId !== session.user.id) {
    return { success: false, error: "You can only delete your own comments." };
  }

  await prisma.postComment.delete({ where: { id: commentId } });

  return { success: true };
}
