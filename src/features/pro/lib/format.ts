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

/** Parses an upstream date string into an ISO date (yyyy-mm-dd), or null. */
export function toIsoDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}
