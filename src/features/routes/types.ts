export type RouteSummary = {
  id: string;
  name: string;
  description: string | null;
  distance: number;
  duration: number;
  elevationGain: number;
  elevationLoss: number;
  createdAt: string;
  createdBy: { id: string; name: string; username: string | null };
  isOwner: boolean;
};

export type LibraryWaypoint = { lat: number; lng: number };

export type LibraryRoute = RouteSummary & {
  groupId: string | null;
  waypoints: LibraryWaypoint[];
};
