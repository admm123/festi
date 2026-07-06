import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

declare global {
  var prisma: PrismaClient | undefined;
}

const client =
  global.prisma ??
  new PrismaClient({
    adapter: dbAdapter,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = client;
}

export const prisma = client;
export const prismaDbAdapter = dbAdapter;
