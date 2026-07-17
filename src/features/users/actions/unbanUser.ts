"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getCurrentAdmin } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function unbanUser(userId: string) {
  const session = await getCurrentAdmin();
  if (!session) {
    return { success: false as const, error: "You are not authorized." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      name: true,
    },
  });

  if (!user) {
    return { success: false as const, error: "User not found." };
  }

  await auth.api.unbanUser({
    headers: await headers(),
    body: {
      userId,
    },
  });

  revalidatePath("/dashboard/admin/users");

  await Logger.log(
    ActivityAction.USER_UNBANNED,
    `${session.user.email} unbanned ${user.name}.`,
    {
      actorId: session.user.id,
      targetUserId: userId,
    },
  );

  return {
    success: true as const,
    message: `${user.name} has been unbanned.`,
  };
}
