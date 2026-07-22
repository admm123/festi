/** Human-readable labels for the ASO stage type codes we have seen. */
const STAGE_TYPE_LABELS: Record<string, string> = {
  PLN: "Flat",
  VAL: "Hilly",
  MMG: "Medium mountain",
  HMG: "High mountain",
  EQU: "Team time trial",
  CLI: "Individual time trial",
};

export function formatStageType(type: string | null): string | null {
  if (!type) return null;
  return STAGE_TYPE_LABELS[type] ?? type;
}

/** Formats a gap in seconds as `+m:ss` (or `+h:mm:ss` beyond an hour). */
export function formatGap(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `+${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `+${minutes}:${String(secs).padStart(2, "0")}`;
}

/** Parses an upstream date string into an ISO date (yyyy-mm-dd), or null. */
export function toIsoDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}
