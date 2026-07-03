"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SearchIcon, UsersIcon } from "lucide-react";

import { getGroups } from "../actions/actions";
import type { Group } from "../types";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeDate } from "../utils/format-relative-date";
import { GroupJoinButton } from "./goup-join-button";

export function GroupsGrid() {
  const [search, setSearch] = useState("");

  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => getGroups(),
  });

  const filteredGroups = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return groups;

    return groups.filter((group) =>
      [group.name, group.createdBy.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [groups, search]);

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading groups...</p>;
  if (isError)
    return <p className="text-sm text-red-500">Failed to load groups.</p>;

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UsersIcon className="mb-4 size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No groups found</p>
          <p className="text-sm text-muted-foreground">
            Try searching for another group.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Link key={group.id} href={`/dashboard/community/g/${group.id}`}>
              <Card className="transition hover:border-red-500/40 hover:bg-muted/40">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="size-12">
                    <AvatarImage src={group.image ?? undefined} sizes="" />
                    <AvatarFallback>
                      <UsersIcon className="size-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{group.name}</p>

                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                      <p>
                        👥 {group.memberCount}{" "}
                        {group.memberCount === 1 ? "member" : "members"}
                      </p>
                      <p>👤 Created by {group.createdBy.name}</p>
                    </div>
                  </div>
                  <GroupJoinButton group={group} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
