"use server";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: dbAdapter });

export async function checkUsernameAvailable(username: string): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { username },
      select: { id: true },
    });

    if (existingUser) {
      return {
        available: false,
        error: "This username is already taken",
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Username check error:", error);
    // Allow signup to continue, the database constraint will catch duplicates
    return { available: true };
  }
}

export async function checkEmailAvailable(email: string): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        available: false,
        error: "An account with this email already exists",
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Email check error:", error);
    return { available: true };
  }
}
