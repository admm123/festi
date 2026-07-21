import type { AsoRace } from "procycling-live/aso";
import { CYCLINGSTAGE_SLUGS } from "procycling-live/gpx";
import { TISSOT_CODES } from "procycling-live/tissot";

/** Curated pro races shown on the hub, mapped onto the three data sources. */
export type ProRaceConfig = {
  /** Internal key, used in the /dashboard/pro/[race] URL. */
  key: string;
  name: string;
  /** ASO Racecenter race key — stages, startlist, teams. */
  asoRace: AsoRace | null;
  /** Tissot competition code — official standings. */
  tissotCode: string | null;
  /** cyclingstage.com CDN slug — per-stage GPX routes. */
  cyclingstageSlug: string | null;
  /** Month the race usually starts (1-12), for context only. */
  typicalStartMonth: number;
  /** One-day race: the GPX comes from the one-day endpoint, not stage files. */
  oneDay: boolean;
};

export const PRO_RACES: ProRaceConfig[] = [
  {
    key: "tour-de-france",
    name: "Tour de France",
    asoRace: "tour-de-france",
    tissotCode: TISSOT_CODES.tourDeFrance,
    cyclingstageSlug: CYCLINGSTAGE_SLUGS.tourDeFrance,
    typicalStartMonth: 7,
    oneDay: false,
  },
  {
    key: "tour-de-france-femmes",
    name: "Tour de France Femmes",
    asoRace: "tour-de-france-femmes",
    tissotCode: TISSOT_CODES.tourDeFranceFemmes,
    cyclingstageSlug: CYCLINGSTAGE_SLUGS.tourDeFranceFemmes,
    typicalStartMonth: 7,
    oneDay: false,
  },
  {
    key: "vuelta-a-espana",
    name: "La Vuelta",
    asoRace: "vuelta",
    tissotCode: TISSOT_CODES.vuelta,
    cyclingstageSlug: CYCLINGSTAGE_SLUGS.vuelta,
    typicalStartMonth: 8,
    oneDay: false,
  },
  {
    key: "criterium-du-dauphine",
    name: "Critérium du Dauphiné",
    asoRace: "dauphine",
    tissotCode: TISSOT_CODES.dauphine,
    cyclingstageSlug: CYCLINGSTAGE_SLUGS.dauphine,
    typicalStartMonth: 6,
    oneDay: false,
  },
  {
    key: "paris-roubaix",
    name: "Paris-Roubaix",
    asoRace: "paris-roubaix",
    tissotCode: null,
    cyclingstageSlug: CYCLINGSTAGE_SLUGS.parisRoubaix,
    typicalStartMonth: 4,
    oneDay: true,
  },
  {
    key: "paris-nice",
    name: "Paris-Nice",
    asoRace: "paris-nice",
    tissotCode: null,
    cyclingstageSlug: CYCLINGSTAGE_SLUGS.parisNice,
    typicalStartMonth: 3,
    oneDay: false,
  },
];

export function getProRace(key: string): ProRaceConfig | null {
  return PRO_RACES.find((race) => race.key === key) ?? null;
}
