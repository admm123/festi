"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
import { prisma } from "@/lib/prisma";
import { updateRoleSchema } from "../schemas";

export async function updateUserRole(userId: string, role: string) {
  const session = await getCurrentAdmin();
  if (!session) {
    return { success: false as const, error: "You are not authorized." };
  }

  const parsed = updateRoleSchema.safeParse({ role });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid role." };
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

  await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
  });

  revalidatePath("/admin/users");

  await Logger.log(
    ActivityAction.USER_ROLE_CHANGED,
    `${session.user.email} changed ${user.name}'s role to ${parsed.data.role}.`,
    {
      actorId: session.user.id,
      targetUserId: userId,
      metadata: { from: user.role, to: parsed.data.role },
    },
  );

  return {
    success: true as const,
    message: `${user.name}'s role changed.`,
  };
}
