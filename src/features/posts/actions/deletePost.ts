"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

type Result = { success: true } | { success: false; error: string };

/** Deletes a post the current user authored. */
export async function deletePost(postId: string): Promise<Result> {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    return { success: false, error: "Post not found." };
  }

  if (post.authorId !== session.user.id) {
    return { success: false, error: "You can only delete your own posts." };
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/dashboard");

  return { success: true };
}
