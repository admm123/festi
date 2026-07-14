export type Waypoint = { lat: number; lng: number };

export type RouteProfile = "trekking" | "fastbike" | "gravel";

export type RideParticipantStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Result of a routing request, returned by the `calculateRoute` action. */
export type RouteResult = {
  /** Total distance in meters. */
  distance: number;
  /** Estimated moving time in seconds. */
  duration: number;
  /** Total ascent in meters (Höhenmeter). */
  elevationGain: number;
  /** Total descent in meters. */
  elevationLoss: number;
  /** Encoded polyline of the full route geometry. */
  routeGeometry: string;
  /** Decoded coordinates as `[lng, lat]` pairs for map rendering. */
  coordinates: [number, number][];
};

export type RideCreator = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
};

export type RideSummary = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  distance: number;
  duration: number;
  elevationGain: number;
  elevationLoss: number;
  routeGeometry: string;
  waypoints: Waypoint[];
  createdAt: string;
  creator: RideCreator;
  participantCount: number;
  isCreator: boolean;
  participantStatus: RideParticipantStatus | null;
};

export type RideParticipantInfo = {
  id: string;
  status: RideParticipantStatus;
  createdAt: string;
  user: RideCreator;
};

export type RideDetail = RideSummary & {
  participants: RideParticipantInfo[];
};
