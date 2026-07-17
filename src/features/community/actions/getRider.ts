"use server";

import { getCurrentUser } from "@/features/auth";
import { prisma } from "@/lib/prisma";

export type Rider = {
  name: string;
  username: string | null;
  image: string | null;
  createdAt: string;
  banned: boolean | null;
  role: string | null;
  bio: string | null;
  location: string | null;
  bikeBrand: string | null;
  bikeModel: string | null;
  skillLevel: string | null;
  ridingStyles: string[];
  yearsRiding: number | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isSelf: boolean;
};

export async function getRider(id: string): Promise<Rider | null> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const rider = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      username: true,
      image: true,
      createdAt: true,
      banned: true,
      role: true,
      bio: true,
      location: true,
      bikeBrand: true,
      bikeModel: true,
      skillLevel: true,
      ridingStyles: true,
      yearsRiding: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  const isFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: id,
      },
    },
  });

  if (!rider) return null;

  return {
    ...rider,
    createdAt: rider.createdAt.toISOString(),
    followersCount: rider._count.followers,
    followingCount: rider._count.following,
    isFollowing: !!isFollowing,
    isSelf: session.user.id === id,
  };
}
