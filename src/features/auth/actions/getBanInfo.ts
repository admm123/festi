"use server";

import { prisma } from "@/lib/prisma";
export async function getBanInfo(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      banned: true,
      banReason: true,
      banExpires: true,
    },
  });

  if (!user?.banned) {
    return null;
  }

  return {
    reason: user.banReason,
    expires: user.banExpires?.toISOString() ?? null,
  };
}
