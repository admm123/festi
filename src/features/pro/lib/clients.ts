import "server-only";

import { AsoClient, type AsoRace } from "procycling-live/aso";
import { CyclingStageClient } from "procycling-live/gpx";
import { TissotClient } from "procycling-live/tissot";

/**
 * Upstream race data (stages, startlists, results, GPX) changes slowly, so we
 * opt into Next's fetch cache with a 1-hour revalidation window.
 */
const CACHE_OPTIONS = { next: { revalidate: 3600 } };

/**
 * Live data (telemetry, mid-race rankings) must never be served stale: these
 * clients bypass the Next fetch cache entirely.
 */
const LIVE_OPTIONS = { next: { revalidate: 0 } };

export function createAsoClient(race: AsoRace, year: number): AsoClient {
  return new AsoClient({ race, year, ...CACHE_OPTIONS });
}

export function createTissotClient(): TissotClient {
  return new TissotClient(CACHE_OPTIONS);
}

export function createCyclingStageClient(): CyclingStageClient {
  return new CyclingStageClient(CACHE_OPTIONS);
}

export function createLiveAsoClient(race: AsoRace, year: number): AsoClient {
  return new AsoClient({ race, year, ...LIVE_OPTIONS });
}

export function createLiveTissotClient(): TissotClient {
  return new TissotClient(LIVE_OPTIONS);
}
