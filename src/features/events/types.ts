/** Serializable calendar event sent from the actions to the client. */
export type CalendarEvent = {
  id: string;
  /** Raw rad-net type label ("RTF", "Radmarathon", …); may be empty. */
  type: string;
  /** Event day as ISO `yyyy-MM-dd`. */
  date: string;
  title: string;
  distances: number[];
  club: string | null;
  lvAbbr: string | null;
  detailUrl: string;
  startZip: string | null;
  startCity: string | null;
  startVenue: string | null;
  startTime: string | null;
  website: string | null;
  /** Null until the detail sync fetched the event's coordinates. */
  lat: number | null;
  lng: number | null;
  cancelled: boolean;
  cancelReason: string | null;
};

export type CalendarSyncResult = {
  /** Another request currently holds the sync lock. */
  locked: boolean;
  /** Events still waiting for their detail pass (coordinates etc.). */
  pendingDetails: number;
};
