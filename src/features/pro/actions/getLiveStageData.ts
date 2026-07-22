"use server";

import type { AsoCompetitor, AsoTeam, AsoTelemetry } from "procycling-live/aso";
import { TissotClient } from "procycling-live/tissot";
import { getCurrentUser } from "@/features/auth/guards";
import { nearestCheckpointWeather } from "../lib/checkpoints";
import {
  createAsoClient,
  createLiveAsoClient,
  createLiveTissotClient,
} from "../lib/clients";
import {
  buildRiderIndex,
  mapAsoGcRows,
  mapTelemetry,
  mapTissotRanking,
  type RiderIdentity,
} from "../lib/live";
import { getProRace, type ProRaceConfig } from "../lib/races";
import type {
  ProLiveStageData,
  ProLiveWeather,
  ProStandingRow,
} from "../types";

const NOT_LIVE: ProLiveStageData = {
  live: false,
  updatedAt: null,
  riders: [],
  info: null,
  weather: null,
  jerseyHolders: [],
  ranking: [],
  rankingSource: null,
};

type StartlistData = {
  competitors: AsoCompetitor[];
  teams: AsoTeam[];
  index: Map<number, RiderIdentity>;
};

const EMPTY_STARTLIST: StartlistData = {
  competitors: [],
  teams: [],
  index: new Map(),
};

/**
 * Startlist join data comes from the cached (1h) client on purpose — names and
 * teams don't change mid-stage, so only the telemetry/rankings themselves need
 * to bypass the cache.
 */
async function fetchStartlist(
  race: ProRaceConfig,
  year: number,
): Promise<StartlistData> {
  if (!race.asoRace) return EMPTY_STARTLIST;
  try {
    const aso = createAsoClient(race.asoRace, year);
    const [competitors, teams] = await Promise.all([
      aso.getRiders(),
      aso.getTeams(),
    ]);
    return { competitors, teams, index: buildRiderIndex(competitors, teams) };
  } catch {
    return EMPTY_STARTLIST;
  }
}

/** Live classification: prefer Tissot when available, fall back to ASO. */
async function fetchLiveRanking(
  race: ProRaceConfig,
  year: number,
  stageNumber: number,
  startlist: StartlistData,
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
      const ranking = mapAsoGcRows(
        payload,
        startlist.competitors,
        startlist.teams,
        startlist.index,
      );
      if (ranking.length > 0) return { ranking, source: "aso" };
    } catch {
      // No live ranking available.
    }
  }
  return { ranking: [], source: null };
}

/**
 * Weather near the head of the race: the meteo record of the course checkpoint
 * closest to the leading GPS-tracked rider. Checkpoints are slow-changing
 * course data, so the cached client is fine; the meteo record itself is
 * updated upstream inside the same payload.
 */
async function fetchHeadWeather(
  race: ProRaceConfig,
  year: number,
  stageNumber: number,
  riders: ProLiveStageData["riders"],
): Promise<ProLiveWeather | null> {
  if (!race.asoRace) return null;
  const head = riders.reduce<(typeof riders)[number] | null>(
    (best, rider) =>
      rider.kmToFinish !== null &&
      (best === null || rider.kmToFinish < (best.kmToFinish ?? Infinity))
        ? rider
        : best,
    null,
  );
  if (!head) return null;
  try {
    const checkpoints = await createAsoClient(
      race.asoRace,
      year,
    ).getCheckpoints(stageNumber);
    return nearestCheckpointWeather(checkpoints, head.lat, head.lng);
  } catch {
    return null;
  }
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
    // The frame for this stage only — anything else (dead upstream, another
    // stage live) means not live.
    telemetry = await createLiveAsoClient(
      race.asoRace,
      year,
    ).getTelemetryForStage(stageNumber);
  } catch {
    // A dead upstream degrades to "no live data" rather than an error.
    return NOT_LIVE;
  }
  if (!telemetry) return NOT_LIVE;

  const startlist = await fetchStartlist(race, year);
  const { riders, info, jerseyHolders, updatedAt } = mapTelemetry(
    telemetry,
    startlist.index,
  );
  // A matched frame with no GPS-tracked riders isn't meaningfully live: show
  // the regular route view instead of a "Live" badge with an empty map.
  if (riders.length === 0) return NOT_LIVE;

  const { ranking, source } = await fetchLiveRanking(
    race,
    year,
    stageNumber,
    startlist,
  );
  const weather = await fetchHeadWeather(race, year, stageNumber, riders);

  return {
    live: true,
    updatedAt,
    riders,
    info,
    weather,
    jerseyHolders,
    ranking,
    rankingSource: source,
  };
}
