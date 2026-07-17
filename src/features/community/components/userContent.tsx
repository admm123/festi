"use client";

import { useQuery } from "@tanstack/react-query";
import { BikeIcon, NewspaperIcon } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserPosts } from "@/features/posts/actions/getUserPosts";
import { PostCard } from "@/features/posts/components/postCard";
import { RideTimelineCard } from "@/features/posts/components/rideTimelineCard";
import type { PostSummary } from "@/features/posts/types";
import { getUserRides } from "@/features/rides/actions/getUserRides";
import type { RideSummary } from "@/features/rides/types";

type Tab = "posts" | "rides";

export function UserContent({ userId }: { userId: string }) {
  const [tab, setTab] = useState<Tab>("posts");

  const posts = useQuery<PostSummary[]>({
    queryKey: ["user-posts", userId],
    queryFn: () => getUserPosts(userId),
    enabled: tab === "posts",
  });

  const rides = useQuery<RideSummary[]>({
    queryKey: ["user-rides", userId],
    queryFn: () => getUserRides(userId),
    enabled: tab === "rides",
  });

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="posts">
            <NewspaperIcon className="size-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="rides">
            <BikeIcon className="size-4" />
            Rides
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "posts" ? (
        <ContentList
          isLoading={posts.isLoading}
          isError={posts.isError}
          isEmpty={(posts.data ?? []).length === 0}
          emptyIcon={
            <NewspaperIcon className="mb-4 size-12 text-muted-foreground/50" />
          }
          emptyText="No posts yet"
        >
          {(posts.data ?? []).map((post, index) => (
            <div
              key={post.id}
              className="duration-500 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </ContentList>
      ) : (
        <ContentList
          isLoading={rides.isLoading}
          isError={rides.isError}
          isEmpty={(rides.data ?? []).length === 0}
          emptyIcon={
            <BikeIcon className="mb-4 size-12 text-muted-foreground/50" />
          }
          emptyText="No rides yet"
        >
          {(rides.data ?? []).map((ride, index) => (
            <div
              key={ride.id}
              className="duration-500 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <RideTimelineCard ride={ride} />
            </div>
          ))}
        </ContentList>
      )}
    </div>
  );
}

function ContentList({
  isLoading,
  isError,
  isEmpty,
  emptyIcon,
  emptyText,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyIcon: React.ReactNode;
  emptyText: string;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {["a", "b", "c"].map((key) => (
          <Skeleton key={key} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Something went wrong loading this content.
      </p>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon}
        <p className="text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return <div className="space-y-4">{children}</div>;
}
