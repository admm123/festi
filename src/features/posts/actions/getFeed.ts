"use server";

import { getCurrentUser } from "@/features/auth/guards";
import type { RideSummary, Waypoint } from "@/features/rides/types";
import { prisma } from "@/lib/prisma";
import type { FeedItem, PostSummary } from "../types";

export type FeedScope = "following" | "discover";

/**
 * Returns the combined timeline: posts and rides interleaved and sorted by
 * creation time (newest first).
 *
 * - `following` (default): content from people you follow, plus your own.
 * - `discover`: content from everyone you don't follow (and not your own).
 */
export async function getFeed(
  scope: FeedScope = "following",
): Promise<FeedItem[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const userId = session.user.id;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  // "following" includes your own content; "discover" excludes both.
  const authorFilter =
    scope === "following"
      ? { in: [...followingIds, userId] }
      : { notIn: [...followingIds, userId] };

  const [posts, rides] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: authorFilter },
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
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    }),
    prisma.ride.findMany({
      where: { creatorId: authorFilter },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        creator: {
          select: { id: true, name: true, username: true, image: true },
        },
        participants: {
          where: { userId },
          select: { status: true },
        },
        _count: {
          select: {
            participants: { where: { status: "APPROVED" } },
            photos: true,
          },
        },
      },
    }),
  ]);

  const postItems: FeedItem[] = posts.map((post) => {
    const summary: PostSummary = {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      images: post.images,
      isAuthor: post.authorId === userId,
      likeCount: post._count.likes,
      likedByMe: post.likes.length > 0,
      commentCount: post._count.comments,
    };
    return { kind: "post", createdAt: summary.createdAt, post: summary };
  });

  const rideItems: FeedItem[] = rides.map((ride) => {
    const summary: RideSummary = {
      id: ride.id,
      title: ride.title,
      description: ride.description,
      startLocation: ride.startLocation,
      startTime: ride.startTime.toISOString(),
      distance: ride.distance,
      duration: ride.duration,
      elevationGain: ride.elevationGain,
      elevationLoss: ride.elevationLoss,
      routeGeometry: ride.routeGeometry,
      waypoints: ride.waypoints as unknown as Waypoint[],
      createdAt: ride.createdAt.toISOString(),
      creator: ride.creator,
      participantCount: ride._count.participants,
      isCreator: ride.creatorId === userId,
      participantStatus: ride.participants[0]?.status ?? null,
      photoCount: ride._count.photos,
    };
    return { kind: "ride", createdAt: summary.createdAt, ride: summary };
  });

  return [...postItems, ...rideItems].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
