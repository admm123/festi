"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/features/auth/guards";
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

  return {
    success: true as const,
    message: `${user.name}'s role changed.`,
  };
}
