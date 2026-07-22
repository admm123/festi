import "server-only";

import {
  AsoClient,
  type AsoCompetitor,
  type AsoRecordMeta,
  type AsoTeam,
  type AsoTelemetry,
  type AsoTelemetryRider,
} from "procycling-live/aso";
import type { TissotRanking } from "procycling-live/tissot";
import type {
  ProJersey,
  ProLiveInfo,
  ProLiveRider,
  ProStandingRow,
} from "../types";

/** ASO's YGPW array order: [Yellow, Green, Polka, White]. */
const YGPW_ORDER: ProJersey[] = ["yellow", "green", "polka", "white"];

export type RiderIdentity = { name: string; team: string | null };

/**
 * Joins the ASO startlist and teams into a bib -> identity lookup, used to
 * label the anonymous telemetry frames.
 */
export function buildRiderIndex(
  competitors: AsoCompetitor[],
  teams: AsoTeam[],
): Map<number, RiderIdentity> {
  const index = new Map<number, RiderIdentity>();
  for (const competitor of competitors) {
    // The allCompetitors bind mixes team records in; riders reference a team.
    if (!competitor.$team || typeof competitor.bib !== "number") continue;
    const team = AsoClient.resolveRef(competitor.$team, teams);
    const name = [competitor.firstname, competitor.lastname]
      .filter(Boolean)
      .join(" ");
    index.set(competitor.bib, {
      name: name || `Bib ${competitor.bib}`,
      team: team?.name ?? null,
    });
  }
  return index;
}

/**
 * Maps a raw telemetry frame into the serializable live payload: rider dots
 * (only entries with usable coordinates), jersey highlights from YGPW, and the
 * info-strip numbers taken from the head of the race.
 */
export function mapTelemetry(
  telemetry: AsoTelemetry,
  index: Map<number, RiderIdentity>,
): {
  riders: ProLiveRider[];
  info: ProLiveInfo | null;
  updatedAt: number | null;
} {
  const jerseys = new Map<number, ProJersey>();
  (telemetry.YGPW ?? []).forEach((bib, position) => {
    const jersey = YGPW_ORDER[position];
    if (typeof bib === "number" && jersey) jerseys.set(bib, jersey);
  });

  const riders: ProLiveRider[] = [];
  for (const rider of telemetry.Riders ?? []) {
    if (
      typeof rider.Bib !== "number" ||
      typeof rider.Latitude !== "number" ||
      typeof rider.Longitude !== "number"
    ) {
      continue;
    }
    const identity = index.get(rider.Bib) ?? null;
    riders.push({
      bib: rider.Bib,
      lat: rider.Latitude,
      lng: rider.Longitude,
      name: identity?.name ?? null,
      team: identity?.team ?? null,
      jersey: jerseys.get(rider.Bib) ?? null,
      kph: typeof rider.kph === "number" ? Math.round(rider.kph) : null,
      kmToFinish:
        typeof rider.kmToFinish === "number"
          ? Math.round(rider.kmToFinish * 10) / 10
          : null,
      secToFirstRider:
        typeof rider.secToFirstRider === "number"
          ? Math.round(rider.secToFirstRider)
          : null,
    });
  }

  // Head of the race = the tracked rider with the least distance to go.
  let head: AsoTelemetryRider | null = null;
  for (const rider of telemetry.Riders ?? []) {
    if (typeof rider.kmToFinish !== "number") continue;
    if (head === null || rider.kmToFinish < (head.kmToFinish ?? Infinity)) {
      head = rider;
    }
  }

  const info: ProLiveInfo | null = head
    ? {
        kmToFinish:
          typeof head.kmToFinish === "number"
            ? Math.round(head.kmToFinish * 10) / 10
            : null,
        speedKph: typeof head.kph === "number" ? Math.round(head.kph) : null,
        avgSpeedKph:
          typeof head.kphAvg === "number" ? Math.round(head.kphAvg) : null,
        temperatureC:
          typeof head.degC === "number" ? Math.round(head.degC) : null,
        gradientPct:
          typeof head.Gradient === "number"
            ? Math.round(head.Gradient * 10) / 10
            : null,
      }
    : null;

  return {
    riders,
    info,
    updatedAt:
      typeof telemetry._updatedAt === "number" ? telemetry._updatedAt : null,
  };
}

/**
 * Maps a Tissot live classification into standing rows, defending against the
 * same shape wobble as the race detail page's standings fetch.
 */
export function mapTissotRanking(ranking: TissotRanking): ProStandingRow[] {
  const results = ranking.results;
  if (!results || results.length === 0) return [];
  return results.map((row) => ({
    rank: typeof row.rank === "number" ? row.rank : null,
    rider: row.rider?.name ?? "Unknown rider",
    team: row.rider?.teamName ?? row.rider?.teamCode ?? null,
    nation: row.rider?.nation ?? null,
    time: typeof row.value === "string" ? row.value : null,
    gap: typeof row.gap === "string" ? row.gap : null,
  }));
}

/** True when the value looks like one classification row. */
function isRowLike(value: unknown): value is AsoRecordMeta {
  if (typeof value !== "object" || value === null) return false;
  const row = value as AsoRecordMeta;
  return (
    typeof row.rank === "number" ||
    typeof row.position === "number" ||
    typeof row.bib === "number" ||
    typeof row.Bib === "number"
  );
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Extracts standing rows from the loosely-typed ASO rankings bind. The payload
 * is an `AsoRecordMeta` (or an array of them) whose exact shape varies per
 * edition, so we only map fields we can verify: rows are recognised by a
 * numeric rank/bib, either directly in the payload or nested in the first
 * array-valued property that contains row-like entries.
 */
export function mapAsoRanking(
  payload: AsoRecordMeta | AsoRecordMeta[] | null,
  index: Map<number, RiderIdentity>,
): ProStandingRow[] {
  if (!payload) return [];
  const records = Array.isArray(payload) ? payload : [payload];

  let rows: AsoRecordMeta[] = records.filter(isRowLike);
  if (rows.length === 0) {
    // Look one level deep for a nested classification (e.g. { rankings: [...] }).
    for (const record of records) {
      for (const value of Object.values(record)) {
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(isRowLike)
        ) {
          rows = value;
          break;
        }
      }
      if (rows.length > 0) break;
    }
  }

  return rows.slice(0, 30).map((row) => {
    const bib = asNumber(row.bib) ?? asNumber(row.Bib);
    const identity = bib !== null ? (index.get(bib) ?? null) : null;
    return {
      rank: asNumber(row.rank) ?? asNumber(row.position),
      rider:
        identity?.name ??
        asString(row.name) ??
        (bib !== null ? `Bib ${bib}` : "Unknown rider"),
      team: identity?.team ?? asString(row.team),
      nation: asString(row.nationality) ?? asString(row.nation),
      time: asString(row.time) ?? asString(row.Time),
      gap: asString(row.gap) ?? asString(row.Gap),
    };
  });
}
