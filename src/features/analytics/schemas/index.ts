import { z } from "zod";

/** Supported analytics time windows. */
export const timeRangeSchema = z.enum(["24h", "7d", "30d", "90d"]).catch("7d");

export type TimeRange = z.infer<typeof timeRangeSchema>;

/** Maps a time range to the number of days it spans. */
export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};
