"use server";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const dbAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: dbAdapter });
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
