import { prisma } from "@/lib/prisma";

export type GroupRole = "owner" | "moderator" | "member";

/**
 * The caller's effective role in a group: the group creator always counts as
 * owner; otherwise the APPROVED membership row's role. Null = not a member.
 */
export async function getGroupRole(
  groupId: string,
  userId: string,
): Promise<GroupRole | null> {
  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId, status: "APPROVED" },
    select: { role: true, group: { select: { createdById: true } } },
  });

  if (!membership) {
    return null;
  }
  if (membership.group.createdById === userId) {
    return "owner";
  }
  return membership.role === "moderator" ? "moderator" : "member";
}

/** Owners and moderators manage join requests, members, and announcements. */
export async function canManageGroup(
  groupId: string,
  userId: string,
): Promise<boolean> {
  const role = await getGroupRole(groupId, userId);
  return role === "owner" || role === "moderator";
}
