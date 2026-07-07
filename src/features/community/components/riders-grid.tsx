"use client";

import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, SearchIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { getRiders } from "../actions/actions";
import type { Rider } from "../types";

export function RidersGrid() {
  const [search, setSearch] = useState("");

  const {
    data: riders = [],
    isLoading,
    isError,
  } = useQuery<Rider[]>({
    queryKey: ["riders"],
    queryFn: () => getRiders(),
  });

  const filteredRiders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return riders;

    return riders.filter((rider) =>
      [rider.name, rider.username, rider.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [riders, search]);

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading riders...</p>;
  if (isError)
    return <p className="text-sm text-red-500">Failed to load riders.</p>;

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search riders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredRiders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UserIcon className="mb-4 size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No riders found</p>
          <p className="text-sm text-muted-foreground">
            Try searching for another name or username.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRiders.map((rider) => (
            <Link key={rider.id} href={`/dashboard/community/u/${rider.id}`}>
              <Card className="transition hover:border-red-500/40 hover:bg-muted/40">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="size-12">
                    <AvatarImage src={rider.image ?? undefined} />
                    <AvatarFallback>
                      {rider.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex w-full items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate font-medium">
                        {rider.name}
                        <BadgeCheck
                          size={15}
                          color={rider.role === "admin" ? "#eab308" : "#3b82f6"}
                        />
                      </p>

                      <p className="truncate text-sm text-muted-foreground">
                        @{rider.username ?? "rider"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium">Joined</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                        }).format(new Date(rider.createdAt))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
