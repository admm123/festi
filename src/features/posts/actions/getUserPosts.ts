"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { PostSummary } from "../types";

/** Returns a specific user's posts, newest first. */
export async function getUserPosts(userId: string): Promise<PostSummary[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  if (!userId) return [];

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true },
      },
      images: {
        orderBy: { position: "asc" },
        select: { id: true, url: true, position: true },
      },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    images: post.images,
    isAuthor: post.authorId === session.user.id,
    likeCount: post._count.likes,
    likedByMe: post.likes.length > 0,
    commentCount: post._count.comments,
  }));
}
