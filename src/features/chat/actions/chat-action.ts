"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { MessageSchema } from "../schemas";
import z from "zod";

const dbAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: dbAdapter });
export async function getGroupMessages(groupId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("You must be signed in.");
  }

  const currentMembership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  });

  if (!currentMembership) {
    throw new Error("You must be a member to view messages.");
  }

  const [messages, members] = await Promise.all([
    prisma.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    }),

    prisma.groupMember.findMany({
      where: { groupId },
      select: {
        userId: true,
      },
    }),
  ]);

  const memberIds = new Set(members.map((member) => member.userId));

  return {
    currentUserId: session.user.id,
    messages: messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      isUserStillMember: memberIds.has(message.userId),
      user: message.user,
    })),
  };
}

export async function sendGroupMessage(values: z.infer<typeof MessageSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("You must be signed in.");
  }

  const validatedFields = MessageSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error,
    };
  }

  const { groupId, content } = validatedFields.data;

  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error("Message cannot be empty.");
  }

  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  });

  if (!membership) {
    throw new Error("You must be a member to send messages.");
  }

  const message = await prisma.groupMessage.create({
    data: {
      groupId,
      userId: session.user.id,
      content: trimmed,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    user: message.user,
  };
}
