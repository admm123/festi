import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import "dotenv/config";

// Use dynamic import for Prisma client since it's ESM
async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Starting seed...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@festi.com" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: "Admin User",
      email: "admin@festi.com",
      emailVerified: true,
      role: "admin",
      banned: false,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: crypto.randomUUID(),
          providerId: "credential",
          password: adminPassword,
        },
      },
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create a sample normal user
  const userPassword = await hashPassword("user1234");

  const user = await prisma.user.upsert({
    where: { email: "raver@festi.com" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: "DJ Raver",
      email: "raver@festi.com",
      emailVerified: true,
      role: "user",
      banned: false,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: crypto.randomUUID(),
          providerId: "credential",
          password: userPassword,
        },
      },
    },
  });

  console.log("✅ Created sample user:", user.email);

  console.log("\n📋 Test credentials:");
  console.log("Admin: admin@festi.com / admin123");
  console.log("User:  raver@festi.com / user1234");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
