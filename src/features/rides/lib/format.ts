/** Presentation helpers for ride statistics. */

import type { RideDifficulty, RidePace } from "../types";

export const RIDE_PACE_OPTIONS: { value: RidePace; label: string }[] = [
  { value: "relaxed", label: "Relaxed" },
  { value: "social", label: "Social" },
  { value: "tempo", label: "Tempo" },
  { value: "fast", label: "Fast" },
];

export const RIDE_DIFFICULTY_OPTIONS: {
  value: RideDifficulty;
  label: string;
}[] = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

/** Human label for a pace value, e.g. `Tempo`. */
export function formatPace(pace: RidePace): string {
  return (
    RIDE_PACE_OPTIONS.find((option) => option.value === pace)?.label ?? pace
  );
}

/** Human label for a difficulty value, e.g. `Hard`. */
export function formatDifficulty(difficulty: RideDifficulty): string {
  return (
    RIDE_DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)
      ?.label ?? difficulty
  );
}

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
