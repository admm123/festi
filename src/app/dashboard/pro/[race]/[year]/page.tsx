import { format } from "date-fns";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ListOrderedIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRaceDetail } from "@/features/pro/actions/getRaceDetail";
import { formatStageType } from "@/features/pro/lib/format";
import type { ProRaceDetail } from "@/features/pro/types";

function stageLabel(stageNumber: number): string {
  return stageNumber === 0 ? "Prologue" : `Stage ${stageNumber}`;
}

function StagesTab({ detail }: { detail: ProRaceDetail }) {
  if (detail.stages.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListOrderedIcon />
          </EmptyMedia>
          <EmptyTitle>No stages published yet</EmptyTitle>
          <EmptyDescription>
            The stage program for {detail.year} hasn&apos;t been announced.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-2">
      {detail.stages.map((stage) => (
        <Link
          key={stage.number}
          href={`/dashboard/pro/${detail.key}/${detail.year}/stage/${stage.number}`}
          className="group flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border p-3 transition-colors hover:border-foreground/30"
        >
          <Badge variant="outline" className="shrink-0">
            {stage.number === 0 ? "P" : stage.number}
          </Badge>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {stage.departure && stage.arrival
                ? `${stage.departure} → ${stage.arrival}`
                : (stage.departure ??
                  stage.arrival ??
                  stageLabel(stage.number))}
            </p>
            <p className="text-xs text-muted-foreground">
              {[
                stage.date ? format(new Date(stage.date), "EEE, MMM d") : null,
                formatStageType(stage.type),
                stage.distanceKm !== null ? `${stage.distanceKm} km` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}

function StartlistTab({ detail }: { detail: ProRaceDetail }) {
  if (detail.startlist.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No startlist published yet</EmptyTitle>
          <EmptyDescription>
            The teams and riders for {detail.year} haven&apos;t been announced.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {detail.startlist.map((team) => (
        <Card key={team.name}>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">{team.name}</CardTitle>
            {team.code && <Badge variant="secondary">{team.code}</Badge>}
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {team.riders.map((rider) => (
                  <TableRow key={`${team.name}-${rider.bib ?? rider.lastName}`}>
                    <TableCell className="w-12 font-mono text-xs text-muted-foreground">
                      {rider.bib ?? "–"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {rider.firstName} {rider.lastName}
                    </TableCell>
                    <TableCell className="w-16 text-right text-xs text-muted-foreground">
                      {rider.nationality ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StandingsTab({ detail }: { detail: ProRaceDetail }) {
  if (!detail.hasStandingsSource) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>Standings not available</EmptyTitle>
          <EmptyDescription>
            Live standings aren&apos;t available for this race.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (detail.standings.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>No standings yet</EmptyTitle>
          <EmptyDescription>
            Check back once the race is underway.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Rank</TableHead>
              <TableHead>Rider</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="w-16">Nation</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.standings.map((row, index) => (
              <TableRow key={`${row.rank ?? index}-${row.rider}`}>
                <TableCell className="font-mono text-xs">
                  {row.rank ?? "–"}
                </TableCell>
                <TableCell className="font-medium">{row.rider}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.team ?? ""}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.nation ?? ""}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {row.gap || row.time || ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default async function ProRacePage({
  params,
}: {
  params: Promise<{ race: string; year: string }>;
}) {
  const { race: raceKey, year: yearParam } = await params;
  const year = Number.parseInt(yearParam, 10);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    notFound();
  }

  const detail = await getRaceDetail(raceKey, year);
  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/pro" aria-label="Back to pro racing">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {detail.name} {detail.year}
          </h1>
          <p className="text-sm text-muted-foreground">
            {detail.stages.length > 0
              ? `${detail.stages.length} ${detail.stages.length === 1 ? "stage" : "stages"}`
              : "Stage program not published yet"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="stages">
        <TabsList>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="startlist">Startlist</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
        </TabsList>
        <TabsContent value="stages" className="mt-4">
          <StagesTab detail={detail} />
        </TabsContent>
        <TabsContent value="startlist" className="mt-4">
          <StartlistTab detail={detail} />
        </TabsContent>
        <TabsContent value="standings" className="mt-4">
          <StandingsTab detail={detail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
