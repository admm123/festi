import { format } from "date-fns";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon,
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
import { getRaceMap } from "@/features/pro/actions/getRaceMap";
import { getRaceReports } from "@/features/pro/actions/getRaceReports";
import { RaceMap } from "@/features/pro/components/raceMap";
import { formatStageType } from "@/features/pro/lib/format";
import type { ProRaceDetail, ProStageReport } from "@/features/pro/types";

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
        <Card
          key={team.name}
          className="overflow-hidden"
          style={
            team.color ? { borderLeft: `3px solid ${team.color}` } : undefined
          }
        >
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              {team.logoUrl && (
                // biome-ignore lint/performance/noImgElement: external ASO CDN logo
                <img
                  src={team.logoUrl}
                  alt=""
                  loading="lazy"
                  className="size-8 shrink-0 object-contain"
                />
              )}
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {team.name}
                </CardTitle>
                {team.code && (
                  <span className="text-xs text-muted-foreground">
                    {team.code}
                  </span>
                )}
              </div>
            </div>
            {team.jerseyUrl && (
              // biome-ignore lint/performance/noImgElement: external ASO CDN jersey
              <img
                src={team.jerseyUrl}
                alt={`${team.name} jersey`}
                loading="lazy"
                className="size-10 shrink-0 object-contain"
              />
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {team.riders.map((rider) => (
                  <TableRow key={`${team.name}-${rider.bib ?? rider.lastName}`}>
                    <TableCell className="w-10 font-mono text-xs text-muted-foreground">
                      {rider.bib ?? "–"}
                    </TableCell>
                    <TableCell className="w-10">
                      {rider.photoUrl ? (
                        // biome-ignore lint/performance/noImgElement: external ASO CDN photo
                        <img
                          src={rider.photoUrl}
                          alt=""
                          loading="lazy"
                          className="size-8 rounded-full bg-muted object-cover"
                        />
                      ) : (
                        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                          {(rider.firstName[0] ?? "") +
                            (rider.lastName[0] ?? "")}
                        </span>
                      )}
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
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {row.riderPhotoUrl && (
                      // biome-ignore lint/performance/noImgElement: external ASO CDN photo
                      <img
                        src={row.riderPhotoUrl}
                        alt=""
                        loading="lazy"
                        className="size-7 shrink-0 rounded-full bg-muted object-cover"
                      />
                    )}
                    <span className="truncate">{row.rider}</span>
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="flex items-center gap-2">
                    {row.teamLogoUrl && (
                      // biome-ignore lint/performance/noImgElement: external ASO CDN logo
                      <img
                        src={row.teamLogoUrl}
                        alt=""
                        loading="lazy"
                        className="size-5 shrink-0 object-contain"
                      />
                    )}
                    <span className="truncate">{row.team ?? ""}</span>
                  </span>
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

function ReportsTab({
  detail,
  reports,
}: {
  detail: ProRaceDetail;
  reports: ProStageReport[];
}) {
  if (reports.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>No official reports yet</EmptyTitle>
          <EmptyDescription>
            {detail.hasStandingsSource
              ? "Official PDFs appear here once stages are timed."
              : "This race has no timing partner publishing reports."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const byStage = new Map<number, ProStageReport[]>();
  for (const report of reports) {
    const group = byStage.get(report.stage) ?? [];
    group.push(report);
    byStage.set(report.stage, group);
  }

  return (
    <div className="space-y-4">
      {[...byStage.entries()]
        .sort(([a], [b]) => a - b)
        .map(([stageNumber, stageReports]) => (
          <Card key={stageNumber}>
            <CardHeader>
              <CardTitle className="text-base">
                {stageLabel(stageNumber)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {stageReports.map((report) => (
                <Button
                  key={report.id}
                  asChild
                  variant="outline"
                  size="sm"
                  className="max-w-full"
                >
                  <a
                    href={`/api/pro/reports/${encodeURIComponent(report.id)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileTextIcon className="size-3.5" />
                    <span className="truncate">{report.name}</span>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
    </div>
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

  const [detail, reports, raceMap] = await Promise.all([
    getRaceDetail(raceKey, year),
    getRaceReports(raceKey, year),
    getRaceMap(raceKey, year),
  ]);
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

      {raceMap && raceMap.stages.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <RaceMap
              stages={raceMap.stages}
              raceKey={detail.key}
              year={detail.year}
              className="h-[320px] lg:h-[420px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3 text-xs text-muted-foreground">
              <span>
                {raceMap.stages.length}{" "}
                {raceMap.stages.length === 1 ? "route" : "stage routes"}
                {raceMap.totalDistanceKm !== null &&
                  ` · ${raceMap.totalDistanceKm.toLocaleString("en-US")} km total`}
                {" · tap a stage for details"}
              </span>
              <span>
                Route data:{" "}
                {raceMap.source === "tissot" ? "Tissot" : "cyclingstage.com"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="stages">
        <TabsList>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="startlist">Startlist</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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
        <TabsContent value="reports" className="mt-4">
          <ReportsTab detail={detail} reports={reports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
