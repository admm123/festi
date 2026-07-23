import { NextResponse } from "next/server";
import type { AsoTelemetry } from "procycling-live/aso";
import { getCurrentUser } from "@/features/auth/guards";
import { createLiveAsoClient } from "@/features/pro/lib/clients";
import { mapTelemetry } from "@/features/pro/lib/live";
import {
  buildLiveStageData,
  fetchStartlist,
} from "@/features/pro/lib/liveStage";
import { fetchStageNews } from "@/features/pro/lib/news";
import { getProRace } from "@/features/pro/lib/races";
import type { ProLiveStageData } from "@/features/pro/types";

/** Comment frames keep intermediaries from reaping an idle connection. */
const HEARTBEAT_MS = 20_000;
/**
 * Slow lane: full snapshot rebuild (telemetry + rankings + weather). Also the
 * liveness check — it flips the panel to live before the first telemetry push
 * and back to not-live after the stage ends.
 */
const REFRESH_MS = 30_000;
/** Upstream reconnect backoff, and the retry hint sent to EventSource. */
const RECONNECT_DELAY_MS = 5_000;

/** Abort-aware sleep: resolves early (never rejects) when the signal fires. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal.addEventListener("abort", done);
  });
}

/**
 * SSE stream of live stage snapshots, replacing the panel's former 8s
 * server-action polling. Two lanes feed the same `snapshot` event:
 *
 * - Fast lane: ASO's own `/live-stream` SSE. Telemetry frames for this stage
 *   are mapped and pushed as they arrive (~5s cadence during racing), so the
 *   browser gets positions at upstream latency with no extra fetches.
 * - Slow lane: every {@link REFRESH_MS} the full snapshot is rebuilt to
 *   refresh rankings/weather and to detect live-status transitions.
 *
 * Every event carries a complete {@link ProLiveStageData}, so a dropped
 * connection needs no patch replay — EventSource reconnects (browser default,
 * plus the `retry` hint) and the first snapshot re-syncs the client.
 */
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/pro/live/[race]/[year]/[stage]">,
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  const params = await ctx.params;
  const race = getProRace(params.race);
  const year = Number(params.year);
  const stageNumber = Number(params.stage);
  if (
    !race?.asoRace ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100 ||
    !Number.isInteger(stageNumber) ||
    stageNumber < 1 ||
    stageNumber > 30
  ) {
    return NextResponse.json({ error: "Unknown stage." }, { status: 404 });
  }
  const asoRace = race.asoRace;

  // One controller tied to everything long-lived in this handler: client
  // disconnect (request.signal / cancel), a dead enqueue, or the run loop
  // finishing all funnel through it so nothing leaks.
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort());
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (frame: string) => {
        if (abort.signal.aborted) return;
        try {
          controller.enqueue(encoder.encode(frame));
        } catch {
          // Enqueue on a closed stream — the client is gone.
          abort.abort();
        }
      };
      const send = (snapshot: ProLiveStageData) =>
        write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);

      const heartbeat = setInterval(
        () => write(": heartbeat\n\n"),
        HEARTBEAT_MS,
      );
      abort.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // Already closed or errored.
        }
      });

      const run = async () => {
        write(`retry: ${RECONNECT_DELAY_MS}\n\n`);

        // The startlist index lives as long as the connection — names and
        // teams don't change mid-stage.
        const startlist = await fetchStartlist(race, year);
        let latest = await buildLiveStageData(
          race,
          year,
          stageNumber,
          startlist,
        );
        if (abort.signal.aborted) return;
        send(latest);

        // Slow lane. Sequential await keeps rebuilds from overlapping.
        const slowLane = (async () => {
          while (!abort.signal.aborted) {
            await sleep(REFRESH_MS, abort.signal);
            if (abort.signal.aborted) return;
            try {
              const next = await buildLiveStageData(
                race,
                year,
                stageNumber,
                startlist,
              );
              // The fast lane may hold a fresher telemetry frame than the
              // rebuild's fetch; keep whichever positions are newest.
              latest =
                next.live &&
                latest.live &&
                (latest.updatedAt ?? 0) > (next.updatedAt ?? 0)
                  ? {
                      ...next,
                      riders: latest.riders,
                      info: latest.info,
                      jerseyHolders: latest.jerseyHolders,
                      updatedAt: latest.updatedAt,
                    }
                  : next;
              send(latest);
            } catch {
              // A failed rebuild keeps the previous snapshot on screen.
            }
          }
        })();

        // Fast lane: forward ASO telemetry pushes for this stage. The package
        // leaves reconnection to the caller, so wrap in a retry loop; the
        // slow lane covers any gap with fresh snapshots.
        const aso = createLiveAsoClient(asoRace, year);
        const telemetryBind = `telemetryCompetitor-${year}`;
        const newsBind = `publication_en-${year}-${stageNumber}`;
        let newsRefreshing = false;
        while (!abort.signal.aborted) {
          try {
            for await (const update of aso.streamLive(abort.signal)) {
              // A new/edited commentary entry: re-fetch the stage feed (the
              // event only carries one record) and push it with the current
              // snapshot. One refresh at a time; a burst of edits collapses
              // into the next one.
              if (update?.bind === newsBind) {
                if (!newsRefreshing) {
                  newsRefreshing = true;
                  void fetchStageNews(race, year, stageNumber)
                    .then((news) => {
                      if (abort.signal.aborted) return;
                      latest = { ...latest, news };
                      send(latest);
                    })
                    .catch(() => {
                      // Keep the previous feed on a flaky upstream.
                    })
                    .finally(() => {
                      newsRefreshing = false;
                    });
                }
                continue;
              }
              // The stream multiplexes every bind (videos, publications,
              // rankings...); only whole telemetry frames for this stage are
              // usable here. Guard `bind` too — keepalive events carry none.
              if (update?.bind !== telemetryBind) continue;
              const frame = update.data as AsoTelemetry | undefined;
              if (!frame || frame.StageIndex !== stageNumber) continue;
              const mapped = mapTelemetry(frame, startlist.index);
              if (mapped.riders.length === 0) continue;
              // ASO emits the same frame more than once and replays the last
              // one on connect; only strictly newer frames are worth pushing.
              if (
                latest.live &&
                mapped.updatedAt !== null &&
                latest.updatedAt !== null &&
                mapped.updatedAt <= latest.updatedAt
              ) {
                continue;
              }
              latest = { ...latest, live: true, ...mapped };
              send(latest);
            }
          } catch {
            // Upstream dropped; back off and reconnect below.
          }
          if (!abort.signal.aborted) {
            await sleep(RECONNECT_DELAY_MS, abort.signal);
          }
        }
        await slowLane;
      };

      void run()
        .catch(() => {
          // Setup failed (e.g. upstream down before the first snapshot);
          // closing makes EventSource retry with a fresh handler.
        })
        .finally(() => abort.abort());
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      // `no-transform` keeps proxies from buffering or compressing the
      // stream, which would hold events back from the client.
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
