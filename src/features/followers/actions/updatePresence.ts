"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

/**
 * Heartbeat: marks the current user as recently active by bumping their
 * `lastSeenAt` timestamp. Called periodically from the client while the app
 * is open and visible. Silently no-ops for unauthenticated callers.
 */
export async function updatePresence(): Promise<void> {
  const session = await getCurrentUser();
  if (!session) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastSeenAt: new Date() },
  });
}
