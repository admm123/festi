"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getCurrentAdmin } from "@/features/auth/guards";
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

  revalidatePath("/admin/users");

  return {
    success: true as const,
    message: `${user.name} has been unbanned.`,
  };
}
