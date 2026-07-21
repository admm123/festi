"use server";

import { AsoClient } from "procycling-live/aso";
import { TissotClient } from "procycling-live/tissot";
import { getCurrentUser } from "@/features/auth/guards";
import { createAsoClient, createTissotClient } from "../lib/clients";
import { toIsoDate } from "../lib/format";
import { getProRace, type ProRaceConfig } from "../lib/races";
import type {
  ProRaceDetail,
  ProStage,
  ProStandingRow,
  ProStartlistTeam,
} from "../types";

async function fetchStages(
  race: ProRaceConfig,
  year: number,
): Promise<ProStage[]> {
  if (!race.asoRace) return [];
  try {
    const aso = createAsoClient(race.asoRace, year);
    const stages = await aso.getStages();
    return stages
      .map((stage, index) => ({
        number: stage.stage ?? stage.id ?? index + 1,
        date: toIsoDate(stage.date),
        type: stage.type ?? null,
        departure: stage.departure?.name ?? null,
        arrival: stage.arrival?.name ?? null,
        distanceKm: typeof stage.length === "number" ? stage.length : null,
      }))
      .sort((a, b) => a.number - b.number);
  } catch {
    return [];
  }
}

async function fetchStartlist(
  race: ProRaceConfig,
  year: number,
): Promise<ProStartlistTeam[]> {
  if (!race.asoRace) return [];
  try {
    const aso = createAsoClient(race.asoRace, year);
    const [competitors, teams] = await Promise.all([
      aso.getCompetitors(),
      aso.getTeams(),
    ]);

    const byTeam = new Map<string, ProStartlistTeam>();
    for (const competitor of competitors) {
      // The allCompetitors bind also contains the team records themselves;
      // actual riders are the ones referencing a team.
      if (!competitor.$team) continue;
      const team = AsoClient.resolveRef(competitor.$team, teams);
      const teamName = team?.name ?? "Unknown team";
      let group = byTeam.get(teamName);
      if (!group) {
        group = { name: teamName, code: team?.code ?? null, riders: [] };
        byTeam.set(teamName, group);
      }
      group.riders.push({
        bib: competitor.bib ?? null,
        firstName: competitor.firstname ?? "",
        lastName: competitor.lastname ?? "",
        nationality: competitor.nationality?.toUpperCase() ?? null,
      });
    }

    for (const group of byTeam.values()) {
      group.riders.sort((a, b) => (a.bib ?? 9999) - (b.bib ?? 9999));
    }
    return [...byTeam.values()].sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

async function fetchStandings(
  race: ProRaceConfig,
  year: number,
): Promise<ProStandingRow[]> {
  if (!race.tissotCode) return [];
  try {
    const tissot = createTissotClient();
    const competitionId = TissotClient.competitionId(race.tissotCode, year);
    const schedule = await tissot.getSchedule(competitionId);
    if (schedule.length === 0) return [];

    // The schedule's hasResult flags are unreliable, so pick the latest stage
    // whose start date has passed and probe backwards from there — during a
    // stage in progress the GC update may not be published yet.
    const now = Date.now();
    let latestStarted = -1;
    schedule.forEach((stage, index) => {
      const start = stage.date ? Date.parse(stage.date) : Number.NaN;
      if (!Number.isNaN(start) && start <= now) latestStarted = index;
    });
    if (latestStarted === -1) latestStarted = schedule.length - 1;

    for (
      let index = latestStarted;
      index >= 0 && index > latestStarted - 3;
      index--
    ) {
      // Rankings are addressed by the 1-based stage number.
      const ranking = await tissot.getOverallRanking(competitionId, index + 1);
      const results = ranking?.results;
      if (results && results.length > 0) {
        return results.map((row) => ({
          rank: typeof row.rank === "number" ? row.rank : null,
          rider: row.rider?.name ?? "Unknown rider",
          team: row.rider?.teamName ?? row.rider?.teamCode ?? null,
          nation: row.rider?.nation ?? null,
          time: row.value ?? null,
          gap: row.gap ?? null,
        }));
      }
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Race detail: stage program, startlist grouped by team, and overall
 * standings (when the race has a Tissot timing partner). Each section fails
 * soft independently so a single flaky upstream never breaks the page.
 * Returns null for unknown race keys.
 */
export async function getRaceDetail(
  raceKey: string,
  year: number,
): Promise<ProRaceDetail | null> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const race = getProRace(raceKey);
  if (!race) return null;

  const [stages, startlist, standings] = await Promise.all([
    fetchStages(race, year),
    fetchStartlist(race, year),
    fetchStandings(race, year),
  ]);

  return {
    key: race.key,
    name: race.name,
    year,
    stages,
    startlist,
    standings,
    hasStandingsSource: race.tissotCode !== null,
  };
}
