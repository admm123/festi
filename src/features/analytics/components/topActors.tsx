"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopActor } from "../types";

type TopActorsProps = {
  actors?: TopActor[];
  isLoading: boolean;
};

export function TopActors({ actors, isLoading }: TopActorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most active users</CardTitle>
        <CardDescription>Ranked by logged actions in range</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !actors ? (
          Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))
        ) : actors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          actors.map((actor, index) => (
            <div key={actor.userId} className="flex items-center gap-3">
              <span className="w-4 text-sm font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <Avatar className="size-9">
                <AvatarImage src={actor.image ?? undefined} alt={actor.name} />
                <AvatarFallback>
                  {actor.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{actor.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {actor.email}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {actor.count}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
