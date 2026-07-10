/**
 * A user is considered "online" if their `lastSeenAt` timestamp is within
 * this many milliseconds of now. Kept slightly larger than the client
 * heartbeat interval so a single missed ping doesn't flip someone offline.
 */
export const PRESENCE_ONLINE_THRESHOLD_MS = 60_000;

/** How often the client sends a heartbeat while the tab is visible. */
export const PRESENCE_HEARTBEAT_INTERVAL_MS = 30_000;

export function isOnline(lastSeenAt: Date | null | undefined): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < PRESENCE_ONLINE_THRESHOLD_MS;
}
