import { format } from "date-fns";
import { CalendarIcon, ChevronRightIcon, RouteIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProRaces } from "@/features/pro/actions/getProRaces";
import type { ProRaceStatus } from "@/features/pro/types";

const STATUS_LABELS: Record<ProRaceStatus, string> = {
  live: "Live now",
  upcoming: "Upcoming",
  finished: "Finished",
  unknown: "Dates TBD",
};

function statusVariant(
  status: ProRaceStatus,
): "default" | "secondary" | "outline" {
  if (status === "live") return "default";
  if (status === "upcoming") return "secondary";
  return "outline";
}

function formatPeriod(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return "Dates not published yet";
  const start = format(new Date(startDate), "MMM d");
  const end = format(new Date(endDate), "MMM d");
  return start === end ? start : `${start} – ${end}`;
}

export default async function ProRacingPage() {
  const races = await getProRaces();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pro Racing</h1>
        <p className="text-muted-foreground">
          Stages, startlists, standings and stage maps from the biggest pro
          races
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {races.map((race) => (
          <Link
            key={race.key}
            href={`/dashboard/pro/${race.key}/${race.year}`}
            className="group"
          >
            <Card className="h-full transition-colors group-hover:border-foreground/30">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{race.name}</CardTitle>
                  <Badge variant={statusVariant(race.status)}>
                    {STATUS_LABELS[race.status]}
                  </Badge>
                </div>
                <CardDescription>{race.year} edition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  {formatPeriod(race.startDate, race.endDate)}
                </p>
                {race.stageCount !== null && (
                  <p className="flex items-center gap-1.5">
                    <RouteIcon className="size-3.5" />
                    {race.stageCount}{" "}
                    {race.stageCount === 1 ? "stage" : "stages"}
                  </p>
                )}
                {race.teamLogos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {race.teamLogos.slice(0, 10).map((logo, index) => (
                      // biome-ignore lint/performance/noImgElement: external ASO CDN logo
                      <img
                        key={`${race.key}-team-${index}`}
                        src={logo}
                        alt=""
                        loading="lazy"
                        className="size-6 object-contain"
                      />
                    ))}
                    {race.teamLogos.length > 10 && (
                      <span className="text-xs text-muted-foreground">
                        +{race.teamLogos.length - 10}
                      </span>
                    )}
                  </div>
                )}
                <p className="flex items-center gap-1 pt-1 text-xs font-medium text-foreground/70 group-hover:text-foreground">
                  View race
                  <ChevronRightIcon className="size-3.5" />
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
