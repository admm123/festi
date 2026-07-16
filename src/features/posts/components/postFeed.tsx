"use client";

import { useQuery } from "@tanstack/react-query";
import { CompassIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeed } from "../actions/getFeed";
import type { FeedItem } from "../types";
import { PostCard } from "./postCard";
import { RideTimelineCard } from "./rideTimelineCard";

export function PostFeed() {
  const [showDiscover, setShowDiscover] = useState(false);

  const {
    data: following = [],
    isLoading,
    isError,
  } = useQuery<FeedItem[]>({
    queryKey: ["posts", "following"],
    queryFn: () => getFeed("following"),
  });

  const discover = useQuery<FeedItem[]>({
    queryKey: ["posts", "discover"],
    queryFn: () => getFeed("discover"),
    enabled: showDiscover,
  });

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
        Something went wrong loading the feed.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {following.length > 0 ? (
        <FeedList items={following} />
      ) : (
        !showDiscover && (
          <EmptyFollowing onDiscover={() => setShowDiscover(true)} />
        )
      )}

      {!showDiscover && following.length > 0 && (
        <DiscoverPrompt onDiscover={() => setShowDiscover(true)} />
      )}

      {showDiscover && (
        <div className="space-y-4 duration-500 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
              <CompassIcon className="size-3.5" />
              Discover
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {discover.isLoading ? (
            <div className="space-y-4">
              {["a", "b"].map((key) => (
                <Skeleton key={key} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : discover.isError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Something went wrong loading more posts.
            </p>
          ) : (discover.data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing else to discover right now.
            </p>
          ) : (
            <FeedList items={discover.data ?? []} />
          )}
        </div>
      )}
    </div>
  );
}

/** Renders a list of feed items with time dividers and staggered animation. */
function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <div className="space-y-4">
      {withDividers(items).map((entry, index) =>
        entry.type === "divider" ? (
          <TimeDivider key={`divider-${entry.label}`} label={entry.label} />
        ) : (
          <div
            key={
              entry.item.kind === "post"
                ? `post-${entry.item.post.id}`
                : `ride-${entry.item.ride.id}`
            }
            className="duration-500 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            {entry.item.kind === "post" ? (
              <PostCard post={entry.item.post} />
            ) : (
              <RideTimelineCard ride={entry.item.ride} />
            )}
          </div>
        ),
      )}
    </div>
  );
}

function DiscoverPrompt({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 pt-4 text-center">
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          You're all caught up
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" onClick={onDiscover}>
        <CompassIcon className="size-4" />
        Discover more from the community
      </Button>
    </div>
  );
}

function EmptyFollowing({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-500/30 py-16 text-center duration-500 animate-in fade-in zoom-in-95">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-500/10">
        <SparklesIcon className="size-7 text-red-500" />
      </div>
      <p className="font-heading text-lg font-semibold">
        Nothing new from people you follow
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Follow more riders, or discover what the rest of the community is
        sharing right now.
      </p>
      <Button className="mt-5" onClick={onDiscover}>
        <CompassIcon className="size-4" />
        Discover
      </Button>
    </div>
  );
}

function TimeDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2 first:pt-0">
      <div className="h-px flex-1 bg-border" />
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Buckets a timestamp into a human-friendly timeline group. */
function bucketFor(dateIso: string): { key: string; label: string } {
  const now = Date.now();
  const then = new Date(dateIso).getTime();
  const days = Math.floor((now - then) / 86_400_000);

  if (days <= 0) return { key: "today", label: "Today" };
  if (days === 1) return { key: "yesterday", label: "Yesterday" };
  if (days < 7) return { key: "week", label: "Earlier this week" };
  if (days < 14) return { key: "lastweek", label: "A week ago" };
  if (days < 31) return { key: "month", label: "Earlier this month" };
  if (days < 365) return { key: "year", label: "Earlier this year" };
  return { key: "older", label: "A long time ago" };
}

type FeedEntry =
  | { type: "divider"; label: string }
  | { type: "item"; item: FeedItem };

/** Interleaves group dividers between items as the time bucket changes. */
function withDividers(items: FeedItem[]): FeedEntry[] {
  const entries: FeedEntry[] = [];
  let currentKey: string | null = null;

  for (const item of items) {
    const bucket = bucketFor(item.createdAt);
    if (bucket.key !== currentKey) {
      entries.push({ type: "divider", label: bucket.label });
      currentKey = bucket.key;
    }
    entries.push({ type: "item", item });
  }

  return entries;
}
