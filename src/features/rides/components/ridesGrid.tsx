"use client";

import { useQuery } from "@tanstack/react-query";
import { BikeIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRides } from "../actions/getRides";
import type { RideSummary } from "../types";
import { RideCard } from "./rideCard";

export function RidesGrid() {
  const {
    data: rides = [],
    isLoading,
    isError,
  } = useQuery<RideSummary[]>({
    queryKey: ["rides"],
    queryFn: () => getRides(),
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
      <p className="py-12 text-center text-sm text-muted-foreground">
        Something went wrong loading rides.
      </p>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BikeIcon className="mb-4 size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No rides scheduled yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first ride and invite others to join!
        </p>
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
