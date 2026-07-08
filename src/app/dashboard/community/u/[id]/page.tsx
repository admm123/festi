import { PrismaPg } from "@prisma/adapter-pg";
import { BadgeCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PrismaClient } from "@/generated/prisma/client";

const dbAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: dbAdapter });
export default async function RiderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rider = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      username: true,
      image: true,
      createdAt: true,
      banned: true,
      role: true,
    },
  });

  if (!rider || rider.banned) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={rider.image ?? undefined} />
          <AvatarFallback>
            {rider.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-4">
            {rider.name}{" "}
            <BadgeCheck
              size={25}
              color={rider.role === "admin" ? "#eab308" : "#3b82f6"}
            />
          </h1>
          <p className="text-muted-foreground">@{rider.username ?? "rider"}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Joined{" "}
        {new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
        }).format(rider.createdAt)}
      </p>
    </div>
  );
}
