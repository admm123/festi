"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { createAsoClient } from "../lib/clients";
import { publicationToArticle, sortArticles } from "../lib/news";
import { getProRace } from "../lib/races";
import type { ProNewsArticle } from "../types";

/** How many of the most recent started stages to pull commentary from. */
const NEWS_STAGE_WINDOW = 2;
/** Cap for the flattened, newest-first article list. */
const MAX_ARTICLES = 30;

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
          .map((publication) => publicationToArticle(publication, stage.number))
          .filter((article): article is ProNewsArticle => article !== null),
      ),
    );

    return sortArticles(
      results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      ),
    ).slice(0, MAX_ARTICLES);
  } catch {
    return [];
  }
}
