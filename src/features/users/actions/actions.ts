"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "@/features/auth/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRoleSchema } from "../schemas";

export async function getUsers() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sessions: {
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          updatedAt: true,
          expiresAt: true,
        },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role ?? "user",
    banned: user.banned ?? false,
    banReason: user.banReason,
    banExpires: user.banExpires?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),

    isOnline: user.sessions.length > 0,
    lastActiveAt: user.sessions[0]?.updatedAt.toISOString() ?? null,
  }));
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();

  const parsed = updateRoleSchema.safeParse({ role });
  if (!parsed.success) {
    throw new Error("Invalid role");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");

  return {
    success: true,
    message: `${user.name}'s role changed.`,
  };
}

export async function banUser(
  userId: string,
  banReason: string,
  banExpiresIn?: number,
) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Admin users cannot be banned");
  }

  await auth.api.banUser({
    headers: await headers(),
    body: {
      userId,
      banReason,
      banExpiresIn,
    },
  });

  revalidatePath("/dashboard/admin/users");

  return {
    success: true,
    message: `${user.name} has been banned.`,
  };
}

export async function unbanUser(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await auth.api.unbanUser({
    headers: await headers(),
    body: {
      userId,
    },
  });

  revalidatePath("/admin/users");

  return {
    success: true,
    message: `${user.name} has been unbanned.`,
  };
}

export async function revokeUserSessions(userId: string) {
  await requireAdmin();

  await auth.api.revokeUserSessions({
    headers: await headers(),
    body: {
      userId,
    },
  });

  revalidatePath("/dashboard/admin/users");

  return {
    success: true,
    message: "User sessions revoked.",
  };
}
