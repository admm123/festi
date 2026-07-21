import type { ElevationPoint, Waypoint } from "@/features/rides/types";

export type ProRaceStatus = "upcoming" | "live" | "finished" | "unknown";

/** A race card on the Pro Racing hub. */
export type ProRaceSummary = {
  key: string;
  name: string;
  year: number;
  status: ProRaceStatus;
  /** ISO date (yyyy-mm-dd) of the first stage, when known. */
  startDate: string | null;
  /** ISO date of the last stage, when known. */
  endDate: string | null;
  stageCount: number | null;
};

/** One stage in a race's program. */
export type ProStage = {
  /** Stage number; 0 denotes a prologue. */
  number: number;
  /** ISO date (yyyy-mm-dd), when known. */
  date: string | null;
  /** ASO stage type code (PLN, VAL, MMG, HMG, ...), when known. */
  type: string | null;
  departure: string | null;
  arrival: string | null;
  distanceKm: number | null;
};

export type ProStartlistRider = {
  bib: number | null;
  firstName: string;
  lastName: string;
  nationality: string | null;
};

export type ProStartlistTeam = {
  name: string;
  code: string | null;
  riders: ProStartlistRider[];
};

export type ProStandingRow = {
  rank: number | null;
  rider: string;
  team: string | null;
  nation: string | null;
  /** Result value (total time for the GC leader). */
  time: string | null;
  /** Gap to the leader, e.g. "+0:42". */
  gap: string | null;
};

/** Everything the race detail page renders. */
export type ProRaceDetail = {
  key: string;
  name: string;
  year: number;
  stages: ProStage[];
  startlist: ProStartlistTeam[];
  /** Empty when no results are published yet. */
  standings: ProStandingRow[];
  /** False when the race has no timing partner at all (e.g. Paris-Roubaix). */
  hasStandingsSource: boolean;
};

/** Serializable stage route payload for the map + elevation chart. */
export type ProStageRoute = {
  /** Encoded polyline of the (downsampled) route geometry. */
  routeGeometry: string;
  /** Start and finish markers. */
  waypoints: Waypoint[];
  elevationProfile: ElevationPoint[];
  distanceMeters: number;
  elevationGain: number;
  elevationLoss: number;
  minEle: number | null;
  maxEle: number | null;
  /** URL of the GPX file the route was parsed from, when known. */
  sourceUrl: string | null;
};

/** Everything the stage detail page renders. */
export type ProStageDetail = {
  raceKey: string;
  raceName: string;
  year: number;
  stage: ProStage;
  /** Null when no GPX route is published for this stage. */
  route: ProStageRoute | null;
};
