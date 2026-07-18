"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

export type GroupAnnouncementItem = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  canDelete: boolean;
};

/**
 * Lists a group's announcements, newest first. Approved members only.
 */
export async function getGroupAnnouncements(
  groupId: string,
): Promise<GroupAnnouncementItem[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId: session.user.id, status: "APPROVED" },
    select: { role: true, group: { select: { createdById: true } } },
  });
  if (!membership) {
    throw new Error("You must be a member of this group.");
  }

  const canModerate =
    membership.group.createdById === session.user.id ||
    membership.role === "moderator";

  const announcements = await prisma.groupAnnouncement.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  return announcements.map((announcement) => ({
    id: announcement.id,
    content: announcement.content,
    createdAt: announcement.createdAt.toISOString(),
    author: announcement.author,
    canDelete: canModerate || announcement.authorId === session.user.id,
  }));
}
