"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "../types";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string | null;
  read: boolean;
  createdAt: string;
  targetType: string | null;
  targetId: string | null;
  actor: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  } | null;
};

/** Lists the current user's notifications, newest first. */
export async function getNotifications(): Promise<NotificationItem[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    targetType: notification.targetType,
    targetId: notification.targetId,
    actor: notification.actor,
  }));
}

/** Number of unseen notifications, used for the header badge. */
export async function getUnreadNotificationCount(): Promise<number> {
  const session = await getCurrentUser();
  if (!session) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });
}

/** Marks all of the current user's notifications as seen. */
export async function markNotificationsSeen(): Promise<void> {
  const session = await getCurrentUser();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
}
