export type Waypoint = { lat: number; lng: number };

export type RouteProfile = "trekking" | "fastbike" | "gravel";

export type RideParticipantStatus = "PENDING" | "APPROVED" | "REJECTED";

/** A geocoded place returned by the `searchPlaces` action. */
export type PlaceResult = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

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
  /** Sampled elevation profile along the route. */
  elevationProfile: ElevationPoint[];
};

/** A single sample of the elevation profile: distance (km) vs. elevation (m). */
export type ElevationPoint = {
  distance: number;
  elevation: number;
  /** Position on the route, for highlighting on the map. */
  lat: number;
  lng: number;
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
  startLocation: string | null;
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
  photoCount: number;
};

export type RideParticipantInfo = {
  id: string;
  status: RideParticipantStatus;
  createdAt: string;
  user: RideCreator;
};

export type RidePhotoInfo = {
  id: string;
  url: string;
  position: number;
};

export type RideDetail = RideSummary & {
  participants: RideParticipantInfo[];
  photos: RidePhotoInfo[];
  elevationProfile: ElevationPoint[];
};
