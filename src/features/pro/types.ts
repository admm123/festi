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

/** Jersey colors, in ASO's YGPW order. */
export type ProJersey = "yellow" | "green" | "polka" | "white";

/** One rider position from the live GPS telemetry feed. */
export type ProLiveRider = {
  bib: number;
  lat: number;
  lng: number;
  /** "Firstname Lastname", when the bib matched the startlist. */
  name: string | null;
  team: string | null;
  /** Jersey worn by this rider, when they lead a classification. */
  jersey: ProJersey | null;
  /** Instantaneous speed (km/h). */
  kph: number | null;
  kmToFinish: number | null;
  /** Gap to the first rider on the road (seconds). */
  secToFirstRider: number | null;
};

/** Summary numbers for the live info strip, from the head of the race. */
export type ProLiveInfo = {
  /** Distance left for the leading rider (km). */
  kmToFinish: number | null;
  /** Speed of the head of the race (km/h). */
  speedKph: number | null;
  /** Average speed of the head of the race (km/h). */
  avgSpeedKph: number | null;
  /** Temperature at the front of the race (°C). */
  temperatureC: number | null;
  /** Road gradient at the front of the race (%). */
  gradientPct: number | null;
};

/** Payload the live stage panel polls for. */
export type ProLiveStageData = {
  /** False when the upstream reports no live racing (telemetry is 204/null). */
  live: boolean;
  /** Epoch ms of the telemetry frame, when the upstream provides it. */
  updatedAt: number | null;
  riders: ProLiveRider[];
  info: ProLiveInfo | null;
  /** Current live classification, empty when none is published. */
  ranking: ProStandingRow[];
  rankingSource: "tissot" | "aso" | null;
};

/** One stage line on the race overview map. */
export type ProRaceMapStage = {
  /** Stage number when known (0 = prologue); null e.g. for a full-route line. */
  number: number | null;
  name: string;
  /** Encoded polyline of the downsampled stage geometry. */
  geometry: string;
  distanceKm: number | null;
};

/** Overview map payload for the race detail page: all stages at once. */
export type ProRaceMap = {
  /** Where the geometry came from: the official Tissot KMZ or per-stage GPX. */
  source: "tissot" | "gpx";
  stages: ProRaceMapStage[];
  totalDistanceKm: number | null;
};

/** An official Tissot report PDF for one stage. */
export type ProStageReport = {
  id: string;
  name: string;
  stage: number;
};

/** One persisted telemetry snapshot, replayed on past stage pages. */
export type ProReplayFrame = {
  /** Epoch ms the frame was captured at. */
  capturedAt: number;
  riders: ProLiveRider[];
};

/** Replay payload for a past stage; frames are in chronological order. */
export type ProStageReplay = {
  frames: ProReplayFrame[];
};
