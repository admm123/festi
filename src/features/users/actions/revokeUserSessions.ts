"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getCurrentAdmin } from "@/features/auth/guards";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";
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

  await Logger.log(
    ActivityAction.OTHER,
    `${session.user.email} revoked sessions for a user.`,
    {
      actorId: session.user.id,
      targetUserId: userId,
      targetType: "RevokeSessions",
    },
  );

  return {
    success: true as const,
    message: "User sessions revoked.",
  };
}
