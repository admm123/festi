"use server";

import { getCurrentUser } from "@/features/auth/guards";
import { fetchCyclingNews } from "../lib/feeds";
import type { NewsArticle } from "../types";

/** Returns merged cycling news articles from public RSS feeds. */
export async function getNews(): Promise<NewsArticle[]> {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("You must be signed in.");
  }
  return fetchCyclingNews();
}
