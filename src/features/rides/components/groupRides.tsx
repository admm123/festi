"use client";

import { useQuery } from "@tanstack/react-query";
import { BikeIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupRides } from "../actions/getGroupRides";
import type { RideSummary } from "../types";
import { RideCard } from "./rideCard";

type GroupRidesProps = {
  groupId: string;
};

/**
 * Upcoming rides posted to a group. Only mounted for approved members; the
 * action re-checks membership on the server.
 */
export function GroupRides({ groupId }: GroupRidesProps) {
  const {
    data: rides = [],
    isLoading,
    isError,
  } = useQuery<RideSummary[]>({
    queryKey: ["group-rides", groupId],
    queryFn: () => getGroupRides(groupId),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {["a", "b", "c"].map((key) => (
          <Skeleton key={key} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Something went wrong loading rides.
      </p>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <BikeIcon className="size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No upcoming rides</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/community-rides/new">Plan one</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} />
      ))}
    </div>
  );
}
