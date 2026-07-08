"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getCurrentAdmin } from "@/features/auth/guards";
import { auth } from "@/lib/auth";

export async function revokeUserSessions(userId: string) {
  const session = await getCurrentAdmin();
  if (!session) {
    return { success: false as const, error: "You are not authorized." };
  }

  await auth.api.revokeUserSessions({
    headers: await headers(),
    body: {
      userId,
    },
  });

  revalidatePath("/dashboard/admin/users");

  return {
    success: true as const,
    message: "User sessions revoked.",
  };
}
