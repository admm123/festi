"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/actions";
import { prisma } from "@/lib/prisma";
import { groupFormSchema } from "../schemas";

export async function getRiders() {
  await requireUser();

  const users = await prisma.user.findMany({
    where: {
      banned: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      createdAt: true,
      role: true,
    },
  });

  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
}

export async function getGroups() {
  const session = await requireUser();

  const groups = await prisma.group.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    image: group.image,
    createdAt: group.createdAt.toISOString(),
    memberCount: group.members.length,
    createdBy: group.createdBy,
    isOwner: group.createdById === session.user.id,
    isMember: group.members.some((member) => member.userId === session.user.id),
  }));
}

export async function createGroup(input: {
  name: string;
  description: string;
  needApproval: boolean;
}) {
  const session = await requireUser();

  const parsed = groupFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid group data.");
  }

  const { name, description, needApproval } = parsed.data;

  const group = await prisma.group.create({
    data: {
      name,
      description,
      needApproval,
      createdById: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
  });

  revalidatePath("/groups");

  return {
    success: true,
    message: `${group.name} has been created.`,
    groupId: group.id,
  };
}

export async function updateGroup({
  groupId,
  name,
  description,
  needApproval,
}: {
  groupId: string;
  name: string;
  description: string;
  needApproval: boolean;
}) {
  const session = await requireUser();

  const parsed = groupFormSchema.safeParse({ name, description, needApproval });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid group data.");
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      createdById: true,
    },
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  if (group.createdById !== session.user.id) {
    throw new Error("Only the group owner can edit this group.");
  }

  const updatedGroup = await prisma.group.update({
    where: { id: groupId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      needApproval: parsed.data.needApproval,
    },
  });

  revalidatePath(`/groups/${groupId}`);

  return {
    success: true,
    message: `${updatedGroup.name} has been updated.`,
  };
}

export async function deleteGroup(groupId: string) {
  const session = await requireUser();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      createdById: true,
    },
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  if (group.createdById !== session.user.id) {
    throw new Error("Only the group owner can delete this group.");
  }

  await prisma.group.delete({
    where: { id: groupId },
  });
}

export async function kickGroupMember({
  groupId,
  memberId,
}: {
  groupId: string;
  memberId: string;
}) {
  const session = await requireUser();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      createdById: true,
    },
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  if (group.createdById !== session.user.id) {
    throw new Error("Only the group owner can kick members.");
  }

  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: {
      userId: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error("Member not found.");
  }

  if (member.userId === group.createdById) {
    throw new Error("You cannot kick the group owner.");
  }

  await prisma.groupMember.delete({
    where: {
      id: memberId,
    },
  });

  revalidatePath(`/groups/${groupId}`);

  return {
    success: true,
    message: `${member.user.name} has been kicked from the group.`,
  };
}

export async function joinGroup(groupId: string) {
  const session = await requireUser();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      createdById: true,
    },
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  if (group.createdById === session.user.id) {
    throw new Error("You cannot join your own group.");
  }

  await prisma.groupMember.create({
    data: {
      groupId,
      userId: session.user.id,
      role: "member",
    },
  });

  return {
    success: true,
    message: "You joined the group.",
  };
}

export async function leaveGroup(groupId: string) {
  const session = await requireUser();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      createdById: true,
    },
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  if (group.createdById === session.user.id) {
    throw new Error("Owners cannot leave their own group.");
  }

  await prisma.groupMember.delete({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  });

  return {
    success: true,
    message: "You left the group.",
  };
}
