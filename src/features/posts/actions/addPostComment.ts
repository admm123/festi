"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import { addCommentSchema } from "../schemas";
import type { PostComment } from "../types";

type Result =
  | { success: true; comment: PostComment }
  | { success: false; error: string };

/** Adds a comment to a post. */
export async function addPostComment(
  postId: string,
  content: string,
): Promise<Result> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = addCommentSchema.safeParse({ content });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid comment.",
    };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return { success: false, error: "Post not found." };
  }

  const comment = await prisma.postComment.create({
    data: {
      postId,
      userId: session.user.id,
      content: parsed.data.content,
    },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  return {
    success: true,
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.user,
      isAuthor: true,
    },
  };
}
