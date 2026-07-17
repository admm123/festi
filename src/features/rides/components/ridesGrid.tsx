"use client";

import { useQuery } from "@tanstack/react-query";
import { BikeIcon, SearchXIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRides } from "../actions/getRides";
import type { RideFiltersInput } from "../schemas";
import type { RideSummary } from "../types";
import { RideCard } from "./rideCard";

type RidesGridProps = {
  filters?: RideFiltersInput;
};

export function RidesGrid({ filters = {} }: RidesGridProps) {
  const {
    data: rides = [],
    isLoading,
    isError,
  } = useQuery<RideSummary[]>({
    queryKey: ["rides", filters],
    queryFn: () => getRides(filters),
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
    const hasActiveFilters = Boolean(
      filters.search || filters.pace || filters.difficulty,
    );

    if (hasActiveFilters) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <SearchXIcon className="mb-4 size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No rides match your filters</p>
          <p className="text-sm text-muted-foreground">
            Try a different search or reset the filters.
          </p>
        </div>
      );
    }

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
