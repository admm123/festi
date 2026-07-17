import { ClockIcon, MessageCircleIcon, UsersIcon } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GroupChat } from "@/features/chat/components/groupChat";
import { DeleteGroupDialog } from "@/features/community/components/deleteGroupDialog";
import { EditGroupDialog } from "@/features/community/components/editGroupDialog";
import { GroupJoinButton } from "@/features/community/components/groupJoinButton";
import { GroupJoinRequests } from "@/features/community/components/groupJoinRequests";
import { KickMemberButton } from "@/features/community/components/kickMemberButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      members: {
        // Only approved members count as members; pending join requests are
        // fetched separately and never leave the server for non-owners.
        where: { status: "APPROVED" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const isOwner = session?.user.id === group.createdById;

  const [ownMembership, pendingMembers] = await Promise.all([
    session
      ? prisma.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: session.user.id,
              groupId: id,
            },
          },
          select: {
            status: true,
          },
        })
      : null,
    isOwner
      ? prisma.groupMember.findMany({
          where: { groupId: id, status: "PENDING" },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        })
      : [],
  ]);

  const isMember = ownMembership?.status === "APPROVED";

  const groupForButton = {
    id: group.id,
    name: group.name,
    image: group.image,
    createdAt: group.createdAt.toISOString(),
    memberCount: group.members.length,
    isOwner,
    isMember,
    membershipStatus: ownMembership?.status ?? null,
    needApproval: group.needApproval,
    createdBy: {
      id: group.createdBy.id,
      name: group.createdBy.name,
    },
  };
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={group.image ?? undefined} />
            <AvatarFallback>
              {group.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-muted-foreground">
              Created by {group.createdBy.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {group.members.length}{" "}
              {group.members.length === 1 ? "member" : "members"}
            </p>
            <p className="text-sm text-muted-foreground italic">
              {group.description || "No description provided."}
            </p>
          </div>
        </div>

        {isOwner && (
          <div>
            <DeleteGroupDialog groupId={group.id} groupName={group.name} />
            <EditGroupDialog
              groupId={group.id}
              currentName={group.name}
              currentDescription={group.description}
              currentNeedApproval={group.needApproval}
              currentImage={group.image}
            />
          </div>
        )}

        {isMember && <GroupJoinButton group={groupForButton} />}
      </div>

      {isMember ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {isOwner && (
              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon className="size-5" />
                    Join requests
                    {pendingMembers.length > 0 && (
                      <Badge variant="destructive">
                        {pendingMembers.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Riders asking to join this group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GroupJoinRequests
                    groupId={group.id}
                    requests={pendingMembers}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="size-5" />
                  Members
                </CardTitle>
                <CardDescription>
                  Riders who are part of this group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={member.user.image ?? undefined} />
                        <AvatarFallback>
                          {member.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {member.user.name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          @{member.user.username ?? "rider"}
                        </p>
                      </div>
                    </div>

                    {isOwner && member.user.id !== group.createdById ? (
                      <KickMemberButton
                        groupId={group.id}
                        memberId={member.id}
                      />
                    ) : (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
                        {member.role}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircleIcon className="size-5" />
                  Group Chat
                </CardTitle>
                <CardDescription>Chat with other group members</CardDescription>
              </CardHeader>
              <CardContent>
                <GroupChat groupId={group.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              {ownMembership?.status === "PENDING"
                ? "Your join request is pending"
                : "You are not a member of this group"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GroupJoinButton group={groupForButton} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
