"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getCurrentAdmin } from "@/features/auth/guards";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";

export async function banUser(
  userId: string,
  banReason: string,
  banExpiresIn?: number,
) {
  const session = await getCurrentAdmin();
  if (!session) {
    return { success: false as const, error: "You are not authorized." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      role: true,
    },
  });

  if (!user) {
    return { success: false as const, error: "User not found." };
  }

  if (user.role === "admin") {
    return { success: false as const, error: "Admin users cannot be banned." };
  }

  await auth.api.banUser({
    headers: await headers(),
    body: {
      userId,
      banReason,
      banExpiresIn,
    },
  });

  revalidatePath("/dashboard/admin/users");

  await Logger.log(
    ActivityAction.USER_BANNED,
    `${session.user.email} banned ${user.name}.`,
    {
      actorId: session.user.id,
      targetUserId: userId,
      metadata: { banReason, banExpiresIn },
    },
  );

  return {
    success: true as const,
    message: `${user.name} has been banned.`,
  };
}
