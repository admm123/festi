"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { createAsoClient, createCyclingStageClient } from "../lib/clients";
import { toIsoDate } from "../lib/format";
import { getProRace, type ProRaceConfig } from "../lib/races";
import { buildStageRoute } from "../lib/route";
import type { ProStage, ProStageDetail, ProStageRoute } from "../types";

async function fetchStageInfo(
  race: ProRaceConfig,
  year: number,
  stageNumber: number,
): Promise<ProStage> {
  if (race.asoRace) {
    try {
      const aso = createAsoClient(race.asoRace, year);
      const stages = await aso.getStages();
      const match = stages.find(
        (stage) => (stage.stage ?? stage.id) === stageNumber,
      );
      if (match) {
        return {
          number: stageNumber,
          date: toIsoDate(match.date),
          type: match.type ?? null,
          departure: match.departure?.name ?? null,
          arrival: match.arrival?.name ?? null,
          distanceKm: typeof match.length === "number" ? match.length : null,
        };
      }
    } catch {
      // Fall through to the minimal stage info below.
    }
  }
  return {
    number: stageNumber,
    date: null,
    type: null,
    departure: null,
    arrival: null,
    distanceKm: null,
  };
}

async function fetchStageRoute(
  race: ProRaceConfig,
  year: number,
  stageNumber: number,
): Promise<ProStageRoute | null> {
  if (!race.cyclingstageSlug) return null;
  try {
    const cyclingstage = createCyclingStageClient();
    if (race.oneDay) {
      const route = await cyclingstage.fetchOneDay(race.cyclingstageSlug, year);
      return route ? buildStageRoute(route, null) : null;
    }
    const result = await cyclingstage.fetchStage(
      race.cyclingstageSlug,
      year,
      stageNumber,
    );
    return result ? buildStageRoute(result.route, result.url) : null;
  } catch {
    return null;
  }
}

/**
 * Stage detail: basic stage info from ASO plus the GPX route (map geometry +
 * elevation profile) from cyclingstage.com. The route is null when no GPX is
 * published for the stage. Returns null for unknown race keys.
 */
export async function getStageDetail(
  raceKey: string,
  year: number,
  stageNumber: number,
): Promise<ProStageDetail | null> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const race = getProRace(raceKey);
  if (!race) return null;

  const [stage, route] = await Promise.all([
    fetchStageInfo(race, year, stageNumber),
    fetchStageRoute(race, year, stageNumber),
  ]);

  return {
    raceKey: race.key,
    raceName: race.name,
    year,
    stage,
    route,
  };
}
