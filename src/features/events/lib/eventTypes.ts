import { format, parseISO } from "date-fns";
import type { CalendarEvent } from "../types";

/**
 * Display buckets for the many rad-net event type labels. Every event is
 * assigned to exactly one group, which drives the marker/legend colors and
 * the type filter.
 */
export const EVENT_TYPE_GROUPS = [
  { key: "rtf", label: "RTF", color: "#22c55e" },
  { key: "marathon", label: "Marathon", color: "#ef4444" },
  { key: "ctf", label: "CTF", color: "#3b82f6" },
  { key: "gravel", label: "Gravel", color: "#f59e0b" },
  { key: "brevet", label: "Brevet", color: "#14b8a6" },
  { key: "etappe", label: "Stage rides", color: "#ec4899" },
  { key: "volk", label: "Everyman rides", color: "#fb923c" },
  { key: "vrtf", label: "vRTF", color: "#8b5cf6" },
  { key: "sonstige", label: "Other", color: "#94a3b8" },
] as const;

export type EventTypeGroupKey = (typeof EVENT_TYPE_GROUPS)[number]["key"];

/** Buckets a raw rad-net type label ("RTF", "Marathon", …) into a group. */
export function eventTypeGroup(type: string): EventTypeGroupKey {
  const label = type.toLowerCase();
  if (label === "vrtf") return "vrtf";
  if (label.includes("rtf")) return "rtf";
  if (label.includes("marathon")) return "marathon";
  if (label.includes("ctf")) return "ctf";
  if (label.includes("gravel")) return "gravel";
  if (label.includes("brevet")) return "brevet";
  if (label.includes("etappen")) return "etappe";
  if (label.includes("volksrad") || label.includes("radwandern")) {
    return "volk";
  }
  return "sonstige";
}

export function eventColor(event: CalendarEvent): string {
  const group = eventTypeGroup(event.type);
  return (
    EVENT_TYPE_GROUPS.find((entry) => entry.key === group)?.color ?? "#94a3b8"
  );
}

/**
 * Landesverband abbreviations as they appear in the rad-net calendar list.
 * Unknown abbreviations fall back to the raw value.
 */
const LV_NAMES: Record<string, string> = {
  BAD: "Baden",
  BAY: "Bayern",
  BER: "Berlin",
  BRA: "Brandenburg",
  BRE: "Bremen",
  HAM: "Hamburg",
  HES: "Hessen",
  MEV: "Mecklenburg-Vorpommern",
  NDS: "Niedersachsen",
  NRW: "Nordrhein-Westfalen",
  RLP: "Rheinland-Pfalz",
  SAC: "Sachsen",
  SAH: "Sachsen-Anhalt",
  SAR: "Saarland",
  SCH: "Schleswig-Holstein",
  THR: "Thüringen",
  WTB: "Württemberg",
};

export function lvName(abbr: string): string {
  return LV_NAMES[abbr] ?? abbr;
}

/** "2026-07-25" → "Sat, 25.07.2026". */
export function formatEventDate(isoDate: string): string {
  return format(parseISO(isoDate), "EEE, dd.MM.yyyy");
}

/** Start location as "83075 Bad Feilnbach", falling back to the venue. */
export function eventLocation(event: CalendarEvent): string | null {
  const zipCity = [event.startZip, event.startCity]
    .filter(Boolean)
    .join(" ")
    .trim();
  return zipCity || event.startVenue || null;
}
