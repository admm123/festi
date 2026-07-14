"use server";

import { getCurrentUser } from "@/features/auth/guards";
import type { PlaceResult } from "../types";

type MapTilerResponse = {
  features?: Array<{
    id?: string;
    place_name?: string;
    text?: string;
    center?: [number, number];
  }>;
};

type NominatimResult = {
  place_id?: number;
  display_name?: string;
  lat?: string;
  lon?: string;
};

/**
 * Geocodes a free-text query into places/addresses. Uses MapTiler geocoding
 * when a key is configured, otherwise falls back to keyless OSM Nominatim.
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  try {
    if (key) {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        trimmed,
      )}.json?key=${key}&limit=6&language=en`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        return [];
      }
      const data = (await response.json()) as MapTilerResponse;
      return (data.features ?? [])
        .filter((feature) => feature.center)
        .map((feature, index) => ({
          id: feature.id ?? `${index}`,
          name: feature.place_name ?? feature.text ?? "Unknown place",
          lng: feature.center?.[0] ?? 0,
          lat: feature.center?.[1] ?? 0,
        }));
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed,
    )}&format=jsonv2&limit=6&addressdetails=0`;
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "FestiRidePlanner/1.0" },
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as NominatimResult[];
    return data
      .filter((result) => result.lat && result.lon)
      .map((result, index) => ({
        id: String(result.place_id ?? index),
        name: result.display_name ?? "Unknown place",
        lng: Number.parseFloat(result.lon ?? "0"),
        lat: Number.parseFloat(result.lat ?? "0"),
      }));
  } catch {
    return [];
  }
}
