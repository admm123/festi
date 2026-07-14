/** Presentation helpers for ride statistics. */

/** Formats a distance in meters as kilometers, e.g. `62.0 km`. */
export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Formats a duration in seconds as `3h 20min` or `45min`. */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
}

/** Formats an elevation value in meters, e.g. `820 hm`. */
export function formatElevation(meters: number): string {
  return `${Math.round(meters)} hm`;
}
