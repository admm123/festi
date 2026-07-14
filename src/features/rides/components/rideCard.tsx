import { format } from "date-fns";
import { BikeIcon, ClockIcon, MountainIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistance, formatDuration, formatElevation } from "../lib/format";
import type { RideSummary } from "../types";
import { RideJoinButton } from "./rideJoinButton";
import { RouteThumbnail } from "./routeThumbnail";

type RideCardProps = {
  ride: RideSummary;
};

export function RideCard({ ride }: RideCardProps) {
  const href = `/dashboard/community-rides/${ride.id}`;

  return (
    <Card className="gap-0 py-0">
      <Link href={href} className="block h-40 w-full">
        <RouteThumbnail routeGeometry={ride.routeGeometry} />
      </Link>

      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start gap-2">
          <BikeIcon className="mt-0.5 size-5 shrink-0 text-red-500" />
          <div className="min-w-0">
            <Link
              href={href}
              className="font-heading font-medium hover:underline"
            >
              {ride.title}
            </Link>
            <p className="text-xs text-muted-foreground">
              {format(new Date(ride.startTime), "EEEE, MMM d 'at' HH:mm")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatDistance(ride.distance)}
          </span>
          <span className="flex items-center gap-1">
            <MountainIcon className="size-3.5" />
            {formatElevation(ride.elevationGain)}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3.5" />
            {formatDuration(ride.duration)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Created by {ride.creator.username ?? ride.creator.name}
          {ride.participantCount > 0 && ` · ${ride.participantCount} joined`}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t py-3">
        <Button asChild variant="outline" size="sm">
          <Link href={href}>View Route</Link>
        </Button>
        <RideJoinButton
          rideId={ride.id}
          isCreator={ride.isCreator}
          participantStatus={ride.participantStatus}
        />
      </CardFooter>
    </Card>
  );
}
