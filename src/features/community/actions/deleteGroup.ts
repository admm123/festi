"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/guards";
import { prisma } from "@/lib/prisma";

export async function deleteGroup(groupId: string) {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false as const, error: "You must be signed in." };
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      createdById: true,
    },
  });

  if (!group) {
    return { success: false as const, error: "Group not found." };
  }

  if (group.createdById !== session.user.id) {
    return {
      success: false as const,
      error: "Only the group owner can delete this group.",
    };
  }

  await prisma.group.delete({
    where: { id: groupId },
  });

  revalidatePath("/groups");

  return {
    success: true as const,
    message: `${group.name} has been deleted.`,
  };
}
