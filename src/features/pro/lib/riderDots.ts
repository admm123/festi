import type { MapDot } from "@/features/rides/types";
import type { ProJersey, ProLiveRider } from "../types";
import { formatGap } from "./format";

/** Dot fill colors per jersey; regular GPS-tracked riders are blue. */
export const JERSEY_COLORS: Record<ProJersey, string> = {
  yellow: "#facc15",
  green: "#16a34a",
  polka: "#ef4444",
  white: "#fafafa",
};

export const DEFAULT_RIDER_COLOR = "#3b82f6";

export const JERSEY_LABELS: Record<ProJersey, string> = {
  yellow: "Yellow jersey",
  green: "Green jersey",
  polka: "Polka dot jersey",
  white: "White jersey",
};

/** Maps rider telemetry to map dots, with jersey wearers highlighted. */
export function ridersToDots(riders: ProLiveRider[]): MapDot[] {
  return riders.map((rider) => {
    const details = [
      rider.team,
      rider.kph !== null ? `${rider.kph} km/h` : null,
      rider.secToFirstRider !== null && rider.secToFirstRider > 0
        ? formatGap(rider.secToFirstRider)
        : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      id: rider.bib,
      lat: rider.lat,
      lng: rider.lng,
      color: rider.jersey ? JERSEY_COLORS[rider.jersey] : DEFAULT_RIDER_COLOR,
      // The white jersey needs a dark outline to stay visible on the map.
      stroke: rider.jersey === "white" ? "#525252" : undefined,
      title: rider.name ?? `Bib ${rider.bib}`,
      subtitle: details || undefined,
    };
  });
}
