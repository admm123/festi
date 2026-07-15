import { requireAuth } from "@/features/auth/guards";
import { AvatarUploader } from "@/features/users/components/avatarUploader";
import { ProfileFollowStats } from "@/features/users/components/profileFollowStats";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      email: true,
      image: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  const name = user?.name ?? session.user.name;
  const followersCount = user?._count.followers ?? 0;
  const followingCount = user?._count.following ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your public profile</p>
      </div>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <AvatarUploader name={name} image={user?.image ?? null} />

        <div className="space-y-1">
          <p className="text-2xl font-semibold">{name}</p>
          {user?.username ? (
            <p className="text-muted-foreground">@{user.username}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <ProfileFollowStats
            followersCount={followersCount}
            followingCount={followingCount}
          />
        </div>
      </div>
    </div>
  );
}
