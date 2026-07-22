"use server";

import type { AsoPublication } from "procycling-live/aso";
import { getCurrentUser } from "@/features/auth/guards";
import { createAsoClient } from "../lib/clients";
import { getProRace } from "../lib/races";
import type { ProNewsArticle } from "../types";

/** How many of the most recent started stages to pull commentary from. */
const NEWS_STAGE_WINDOW = 2;
/** Cap for the flattened, newest-first article list. */
const MAX_ARTICLES = 30;

/** Social embeds carry no readable body — keep only editorial items. */
const SKIPPED_TYPES = new Set(["twitter", "instagram", "fastory"]);

/** Minimal entity decoding for the stripped paragraph text. */
function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'");
}

/** Strips ASO's paragraph HTML ("<br />" line breaks, tags) to plain text. */
function toPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim(),
  );
}

function toArticle(
  publication: AsoPublication,
  stageNumber: number,
): ProNewsArticle | null {
  if (SKIPPED_TYPES.has(publication.type ?? "")) return null;
  const title = publication.title?.trim();
  if (!title) return null;
  // `text` is an array of HTML paragraphs (sometimes a plain string sneaks in).
  const raw = publication.text;
  const parts = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
  const paragraphs = parts.map(toPlainText).filter((part) => part.length > 0);
  return {
    id: publication._id ?? `${stageNumber}-${title}`,
    title,
    paragraphs,
    stage: stageNumber,
    publishedAt: publication.publicationAt ?? null,
    pinned: publication.pinned === true,
  };
}

/**
 * Latest race-center news/commentary for a race: the English publications of
 * the most recent started stages, flattened newest-first. Empty when the race
 * has not started or nothing is published; a flaky upstream fails soft.
 */
export async function getRaceNews(
  raceKey: string,
  year: number,
): Promise<ProNewsArticle[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }

  const race = getProRace(raceKey);
  if (!race?.asoRace) return [];

  try {
    const aso = createAsoClient(race.asoRace, year);
    const stages = await aso.getStages();
    const today = new Date().toISOString().slice(0, 10);
    const started = stages
      .map((stage) => ({
        number: stage.stage ?? stage.id,
        date: stage.dateLocal ?? null,
      }))
      .filter(
        (stage): stage is { number: number; date: string } =>
          typeof stage.number === "number" &&
          stage.date !== null &&
          stage.date <= today,
      )
      .sort((a, b) => b.number - a.number)
      .slice(0, NEWS_STAGE_WINDOW);

    const results = await Promise.allSettled(
      started.map(async (stage) =>
        (await aso.getPublications(stage.number, "en"))
          .map((publication) => toArticle(publication, stage.number))
          .filter((article): article is ProNewsArticle => article !== null),
      ),
    );

    return results
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .sort((a, b) => {
        const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return bTime - aTime;
      })
      .slice(0, MAX_ARTICLES);
  } catch {
    return [];
  }
}
