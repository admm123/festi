import { cache } from "react";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * On Cloudflare Workers a database connection cannot be reused across requests
 * (the socket from a previous request is dead by the next invocation). Reusing
 * a global client/pool causes the intermittent "first request fails, retry
 * works" behaviour. So we create a fresh client per request.
 *
 * `cache` memoizes the client within a single request, and `maxUses: 1` ensures
 * pooled connections are never reused across requests.
 */
const getClient = cache(() => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    maxUses: 1,
  });
  return new PrismaClient({ adapter });
});

// Exposed as `prisma` so existing call sites (`import { prisma }`) keep working,
// while every property access resolves to the current request's client.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
