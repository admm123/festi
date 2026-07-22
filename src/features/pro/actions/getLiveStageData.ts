"use server";

import type { AsoTelemetry } from "procycling-live/aso";
import { TissotClient } from "procycling-live/tissot";
import { getCurrentUser } from "@/features/auth/guards";
import {
  createAsoClient,
  createLiveAsoClient,
  createLiveTissotClient,
} from "../lib/clients";
import {
  buildRiderIndex,
  mapAsoRanking,
  mapTelemetry,
  mapTissotRanking,
  type RiderIdentity,
} from "../lib/live";
import { getProRace, type ProRaceConfig } from "../lib/races";
import type { ProLiveStageData, ProStandingRow } from "../types";

const NOT_LIVE: ProLiveStageData = {
  live: false,
  updatedAt: null,
  riders: [],
  info: null,
  ranking: [],
  rankingSource: null,
};

/**
 * Startlist join data comes from the cached (1h) client on purpose — names and
 * teams don't change mid-stage, so only the telemetry/rankings themselves need
 * to bypass the cache.
 */
async function fetchRiderIndex(
  race: ProRaceConfig,
  year: number,
): Promise<Map<number, RiderIdentity>> {
  if (!race.asoRace) return new Map();
  try {
    const aso = createAsoClient(race.asoRace, year);
    const [competitors, teams] = await Promise.all([
      aso.getCompetitors(),
      aso.getTeams(),
    ]);
    return buildRiderIndex(competitors, teams);
  } catch {
    return new Map();
  }
}

/** Live classification: prefer Tissot when available, fall back to ASO. */
async function fetchLiveRanking(
  race: ProRaceConfig,
  year: number,
  stageNumber: number,
  index: Map<number, RiderIdentity>,
): Promise<{ ranking: ProStandingRow[]; source: "tissot" | "aso" | null }> {
  if (race.tissotCode) {
    try {
      const tissot = createLiveTissotClient();
      const competitionId = TissotClient.competitionId(race.tissotCode, year);
      const live = await tissot.getLiveRankings(competitionId, stageNumber);
      if (live) {
        const ranking = mapTissotRanking(live);
        if (ranking.length > 0) return { ranking, source: "tissot" };
      }
    } catch {
      // Fall through to ASO.
    }
  }
  if (race.asoRace) {
    try {
      const aso = createLiveAsoClient(race.asoRace, year);
      const payload = await aso.getRankings(stageNumber);
      const ranking = mapAsoRanking(payload, index);
      if (ranking.length > 0) return { ranking, source: "aso" };
    } catch {
      // No live ranking available.
    }
  }
  return { ranking: [], source: null };
}

/**
 * One live snapshot for the stage page's polling panel: rider GPS positions
 * joined against the startlist, info-strip numbers, and the current live
 * classification. Returns `live: false` when ASO reports no live racing
 * (telemetry 204/null) — the normal state outside stage hours.
 */
export async function getLiveStageData(
  raceKey: string,
  year: number,
  stageNumber: number,
): Promise<ProLiveStageData> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const race = getProRace(raceKey);
  if (!race?.asoRace) return NOT_LIVE;

  let telemetry: AsoTelemetry | null;
  try {
    telemetry = await createLiveAsoClient(race.asoRace, year).getTelemetry();
  } catch {
    // A dead upstream degrades to "no live data" rather than an error.
    return NOT_LIVE;
  }
  if (!telemetry) return NOT_LIVE;

  const index = await fetchRiderIndex(race, year);
  const { riders, info, updatedAt } = mapTelemetry(telemetry, index);
  const { ranking, source } = await fetchLiveRanking(
    race,
    year,
    stageNumber,
    index,
  );

  return {
    live: true,
    updatedAt,
    riders,
    info,
    ranking,
    rankingSource: source,
  };
}
