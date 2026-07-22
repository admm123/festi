"use client";

import {
  FlagIcon,
  GaugeIcon,
  MountainIcon,
  ThermometerIcon,
  TimerIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLiveStageData } from "../actions/getLiveStageData";
import { formatGap } from "../lib/format";
import {
  DEFAULT_RIDER_COLOR,
  JERSEY_COLORS,
  JERSEY_LABELS,
  ridersToDots,
} from "../lib/riderDots";
import type { ProLiveStageData, ProStageRoute } from "../types";
import { StageRoutePanel } from "./stageRoutePanel";

/** Matches ASO's ~5s telemetry cadence without hammering the upstream. */
const POLL_MS = 8000;

type LiveStagePanelProps = {
  raceKey: string;
  year: number;
  stageNumber: number;
  /** Null when no GPX route is published for this stage. */
  route: ProStageRoute | null;
};

function LiveBadge() {
  return (
    <Badge className="gap-1.5 bg-red-600 text-white hover:bg-red-600">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      Live
    </Badge>
  );
}

function LiveInfoStrip({ data }: { data: ProLiveStageData }) {
  const info = data.info;
  // Spread of the race: the biggest gap among GPS-tracked riders.
  const maxGap = data.riders.reduce(
    (max, rider) => Math.max(max, rider.secToFirstRider ?? 0),
    0,
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <LiveBadge />
      {info?.kmToFinish !== null && info?.kmToFinish !== undefined && (
        <Badge variant="secondary">
          <FlagIcon className="size-3" />
          {info.kmToFinish} km to go
        </Badge>
      )}
      {info?.speedKph !== null && info?.speedKph !== undefined && (
        <Badge variant="secondary">
          <GaugeIcon className="size-3" />
          {info.speedKph} km/h at the front
        </Badge>
      )}
      {maxGap > 0 && (
        <Badge variant="secondary">
          <TimerIcon className="size-3" />
          {formatGap(maxGap)} spread
        </Badge>
      )}
      {info?.temperatureC !== null && info?.temperatureC !== undefined && (
        <Badge variant="outline">
          <ThermometerIcon className="size-3" />
          {info.temperatureC} °C
        </Badge>
      )}
      {info?.gradientPct !== null && info?.gradientPct !== undefined && (
        <Badge variant="outline">
          <MountainIcon className="size-3" />
          {info.gradientPct}%
        </Badge>
      )}
    </div>
  );
}

function JerseyLegend() {
  const entries = [
    ...Object.entries(JERSEY_LABELS).map(([jersey, label]) => ({
      color: JERSEY_COLORS[jersey as keyof typeof JERSEY_COLORS],
      label,
    })),
    { color: DEFAULT_RIDER_COLOR, label: "GPS-tracked rider" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {entries.map((entry) => (
        <span key={entry.label} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full border border-black/20"
            style={{ backgroundColor: entry.color }}
          />
          {entry.label}
        </span>
      ))}
    </div>
  );
}

function LiveRankingCard({ data }: { data: ProLiveStageData }) {
  if (data.ranking.length === 0) return null;
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Live standings</CardTitle>
        {data.rankingSource && (
          <Badge variant="secondary">
            {data.rankingSource === "tissot" ? "Tissot" : "ASO"}
          </Badge>
        )}
      </CardHeader>
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
            {data.ranking.map((row, index) => (
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

/**
 * Live coverage for a stage that may currently be racing: polls the live
 * server action while the tab is visible and layers rider GPS dots onto the
 * stage map. Outside live racing it renders the static route panel plus a
 * subtle hint, so the page looks like the regular stage page.
 */
export function LiveStagePanel({
  raceKey,
  year,
  stageNumber,
  route,
}: LiveStagePanelProps) {
  const [data, setData] = useState<ProLiveStageData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const tick = async () => {
      // Pause polling while the tab is hidden; visibilitychange resumes it.
      if (document.hidden || inFlight) {
        schedule();
        return;
      }
      inFlight = true;
      try {
        const next = await getLiveStageData(raceKey, year, stageNumber);
        if (!cancelled) setData(next);
      } catch {
        // A failed poll keeps the previous snapshot; never crash the page.
      } finally {
        inFlight = false;
      }
      schedule();
    };

    const schedule = () => {
      if (cancelled) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(tick, POLL_MS);
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        void tick();
      }
    };

    void tick();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [raceKey, year, stageNumber]);

  const live = data?.live === true;
  const dots = useMemo(
    () => (live && data ? ridersToDots(data.riders) : undefined),
    [live, data],
  );

  return (
    <div className="space-y-4">
      {live && data && <LiveInfoStrip data={data} />}

      {route && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StageRoutePanel
              routeGeometry={route.routeGeometry}
              waypoints={route.waypoints}
              elevationProfile={route.elevationProfile}
              riderDots={dots}
            />
          </CardContent>
        </Card>
      )}

      {live && dots && dots.length > 0 && <JerseyLegend />}

      {live && data && <LiveRankingCard data={data} />}

      {!live && (
        <p className="text-xs text-muted-foreground">
          Live tracking appears here during the stage.
        </p>
      )}
    </div>
  );
}
