import { format } from "date-fns";
import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/features/auth/guards";
import { getRide } from "@/features/rides/actions/getRide";
import { DeleteRideButton } from "@/features/rides/components/deleteRideButton";
import { RideJoinButton } from "@/features/rides/components/rideJoinButton";
import { RideParticipants } from "@/features/rides/components/rideParticipants";
import { RidePhotos } from "@/features/rides/components/ridePhotos";
import { RoutePreview } from "@/features/rides/components/routePreview";
import { RouteStatsPanel } from "@/features/rides/components/routeStatsPanel";

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ rideId: string }>;
}) {
  await requireAuth();
  const { rideId } = await params;
  const ride = await getRide(rideId);

  if (!ride) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/community-rides" aria-label="Back to rides">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{ride.title}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            {format(new Date(ride.startTime), "EEEE, MMM d yyyy 'at' HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ride.isCreator && <DeleteRideButton rideId={ride.id} />}
          <RideJoinButton
            rideId={ride.id}
            isCreator={ride.isCreator}
            participantStatus={ride.participantStatus}
            isPast={new Date(ride.startTime).getTime() < Date.now()}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[360px] w-full lg:h-[520px]">
              <RoutePreview
                routeGeometry={ride.routeGeometry}
                waypoints={ride.waypoints}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <RouteStatsPanel
            route={{
              distance: ride.distance,
              duration: ride.duration,
              elevationGain: ride.elevationGain,
              elevationLoss: ride.elevationLoss,
              routeGeometry: ride.routeGeometry,
              coordinates: [],
            }}
          />

          {ride.description && (
            <Card>
              <CardContent className="py-4 text-sm whitespace-pre-wrap">
                {ride.description}
              </CardContent>
            </Card>
          )}

          {ride.startLocation && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
              <span>Starts at {ride.startLocation}</span>
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Created by{" "}
            <span className="text-foreground">
              {ride.creator.username ?? ride.creator.name}
            </span>
          </p>

          <RideParticipants
            isCreator={ride.isCreator}
            creator={ride.creator}
            participants={ride.participants}
          />

          <RidePhotos
            rideId={ride.id}
            photos={ride.photos}
            title={ride.title}
            canManage={
              ride.isCreator && new Date(ride.startTime).getTime() < Date.now()
            }
          />
        </div>
      </div>
    </div>
  );
}
