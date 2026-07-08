"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

export async function getRiders() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const users = await prisma.user.findMany({
    where: {
      banned: false,
      NOT: { id: session.user.id },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      createdAt: true,
      role: true,
    },
  });

  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
}
