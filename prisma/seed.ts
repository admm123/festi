import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import "dotenv/config";

// Use dynamic import for Prisma client since it's ESM
async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Starting seed...");

  /**
   * Idempotently ensures a user with a credential account exists. Safe to run
   * on every deploy: existing users/accounts are left untouched, and a missing
   * credential account is created (self-healing) without ever duplicating rows.
   */
  async function ensureUser(opts: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) {
    const user = await prisma.user.upsert({
      where: { email: opts.email },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: opts.name,
        email: opts.email,
        emailVerified: true,
        role: opts.role,
        banned: false,
      },
    });

    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });

    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: await hashPassword(opts.password),
        },
      });
    }

    return user;
  }

  const admin = await ensureUser({
    name: "Admin User",
    email: "admin@festi.com",
    role: "admin",
    password: "admin123",
  });
  console.log("✅ Ensured admin user:", admin.email);

  const user = await ensureUser({
    name: "Alex Rider",
    email: "rider@festi.com",
    role: "user",
    password: "user1234",
  });
  console.log("✅ Ensured sample user:", user.email);

  console.log("\n📋 Test credentials:");
  console.log("Admin: admin@festi.com / admin123");
  console.log("User:  rider@festi.com / user1234");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
