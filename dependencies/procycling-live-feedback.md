# Feedback: procycling-live — Review of 0.2.0

The original feedback (against 0.1.0, from building festi's Pro Racing section) is
preserved below with a resolution status per point. **Verdict: every reported bug and
essentially every feature wish is addressed in 0.2.0** — mostly by adopting the exact
helpers we had written consumer-side.

## Status per original point

### Bugs — all fixed

1. **`getTelemetry()` return type** — ✅ Fixed. Now returns `AsoTelemetry[] | null`,
   `StageIndex` is typed on `AsoTelemetry`, and the library ships both
   `getTelemetryForStage(stage)` and an exported `pickTelemetryFrame()` helper.
   Frame semantics ("empty `Riders` = not meaningfully live") are documented.
2. **`getFile()` without content type** — ✅ Fixed. Returns `TissotFile { bytes,
   contentType }`; content type comes from the response header when specific, else
   magic-byte sniffing (PDF/JPEG/PNG/GIF). `TissotReport.extension` is documented as
   unreliable.
3. **Unreliable `hasResult` flags** — ✅ Fixed. Documented on `getSchedule()`, and the
   new `getLatestOverallRanking(competitionId)` encapsulates exactly our
   latest-started-stage + probe-backwards logic — better than ours, since it resolves
   the naive race-local stage dates via the schedule's `utcOffset` and uses `phaseId`
   (not the schedule `key`, which is rejected with HTTP 400 — a trap we hadn't hit yet).
4. **Race-local midnight dates** — ✅ Fixed. `getStages()`/`getStage()` populate
   `dateLocal` ("yyyy-mm-dd", verbatim, no timezone conversion), `stageDateLocal()` is
   exported, and the trap is documented on `AsoStage.date`.

### Missing types — all fixed

5. **Image fields** — ✅ Typed: `AsoTeam.logo/logo_live/jersey/jersey_sm/color/banner/
   header`, `AsoCompetitor.profile/profile_sm/profile_podium_live`. The "#000000"
   placeholder quirk is documented on `AsoTeam.color`.
6. **`getCompetitors()` mixing in team records** — ✅ Documented, plus a pre-filtered
   `getRiders()` (entries with `$team`).
7. **Shapeless `AsoRanking`** — ✅ `mapRankings()` / `mapRankingRows()` normalize the
   heterogeneous `rankingType` bind into typed `AsoClassification`/`AsoRankingRow`,
   including `$rider` ref resolution, bib fallback, and ms→"H:MM:SS"/gap formatting.

### Data quirks — all documented

- Black team color, GPS-sample telemetry coverage, jersey wearers possibly untracked:
  documented on the respective types/methods.
- **Cross-source identity**: `AsoCompetitor.UCICode` is now explicitly documented as the
  canonical join key to `TissotRider.uciRiderId`.

### Feature wishes — all delivered

- ✅ `getTelemetryForStage()` / `pickTelemetryFrame()`
- ✅ `getLatestOverallRanking()`
- ✅ Typed `getMillesime()` + `getCurrentMillesime()` (jersey images, timezone)
- ✅ `getRaceDayStatus()` (today's stage + liveness, derived timezone-safely)
- ✅ `getFile()` with content type

### Bonus additions beyond the feedback

- Tissot `getStageDetail()` / `getStageProfile()` (elevation profile JSON + route KMZ
  per stage — potentially simpler than our cyclingstage GPX path).
- New ASO endpoints: checkpoints (with KOM/sprint markers, passage schedules, live
  weather), withdrawals, social content, gallery images, videos, publications, extra
  vehicles, fantasy points.
- `getLiveRankings()` maps the mid-race 404 to `null` — matches our "not live"
  semantics.
- `getSchedule()` normalizes array vs. wrapped payload shapes and exposes `utcOffset`.

## Remaining gaps (minor)

- **No cross-source join helper**: the UCI join key is documented on both sides, but
  joining Tissot standings to ASO imagery is still consumer code. A small
  `buildUciIndex(competitors)` / lookup helper would remove the last bit of our
  name-normalization heuristic (`src/features/pro/lib/images.ts`).

## Migration notes for festi (0.1.0 → 0.2.0) — completed

The migration is done; the consumer-side workarounds were deleted:

- `getTelemetry()` returns an **array** — our own `pickTelemetryFrame` in
  `src/features/pro/lib/live.ts` was deleted in favor of `getTelemetryForStage()`.
- `getFile()` returns `TissotFile` — the magic-byte sniffing in
  `src/app/api/pro/reports/[reportId]/route.ts` was deleted.
- `getSchedule()` returns `TissotSchedule` (`{ stages, utcOffset }`) —
  `getRaceReports.ts` uses `.stages` and resolves the naive stage dates via
  `utcOffset`; stage references use `phaseId`.
- The standings probe-back logic in `getRaceDetail.ts` was replaced by
  `getLatestOverallRanking()`; the `$team` filter by `getRiders()`; `toIsoDate`
  on stages by `dateLocal` (the helper was deleted from `lib/format.ts`);
  `mapAsoRanking` by the library's `mapRankings()` (`mapAsoGcRows` in
  `lib/live.ts` picks the "itg" classification).
- Bonus: rider photos in the standings now join via the UCI licence code
  (`buildRiderUciIndex` in `lib/images.ts`), with the name matching kept only
  as a fallback.

Built on top of the new API since:

- Stage maps show KOM/sprint POIs from `getCheckpoints()`; the live panel
  shows weather from the checkpoint nearest to the head of the race.
- The startlist marks withdrawn riders ("DNF st. N") from `getWithdrawals()`.
- A News tab on the race detail page renders `getPublications()` commentary.
- Stage routes prefer the official Tissot per-stage KMZ + elevation profile
  (`buildTissotRoute` in `lib/tissotRoute.ts`), cyclingstage GPX as fallback.
  Note: the profile's `distance` values are **meters** despite the doc saying
  km — worth fixing in the lib's `TissotProfilePoint` doc.

---

# Original feedback (against 0.1.0)

Context: we built a "Pro Racing" section on top of the vendored `procycling-live` tarball
(race hub, stage pages with GPX maps, live GPS tracking, live standings, official Tissot
reports, telemetry replay). The core client design (fetch-on-demand, `resolveRef`, SSE
stream, automatic retry on truncated JSON) worked well — this list is everything we had
to fix or work around on the consumer side, i.e. things that would ideally live in the
library itself.

## Bugs

### 1. `getTelemetry()` return type does not match reality (biggest issue)

Typed as `Promise<AsoTelemetry | null>`, but the `telemetryCompetitor` bind is actually
an **array of per-stage frames**, each with its own `Riders`, `YGPW` and `StageIndex`.
Following the types, `telemetry.Riders` / `telemetry.YGPW` are always `undefined`, so
live telemetry silently never shows up — exactly what happened to us.

We fixed it with a `pickTelemetryFrame(raw, stageNumber)` helper that unwraps the frame
for the requested stage (`src/features/pro/lib/live.ts:65`).

### 2. `TissotClient.getFile()` gives no content type — not every report is a PDF

The "Photofinish" report is a JPG/PNG image, and the registry's `extension` field is
occasionally bogus (we observed `"unknow"`). Serving the bytes as `application/pdf`
renders a blank page in the browser. We now sniff magic bytes in our proxy route
(`src/app/api/pro/reports/[reportId]/route.ts:15`).

### 3. Tissot schedule flags (`hasResult`, `hasStartlist`) are unreliable

To find the current standings we had to ignore `hasResult`, compute the latest stage
whose start date has passed, and probe backwards up to 3 stages because the GC update
may not be published yet mid-stage (`src/features/pro/actions/getRaceDetail.ts:128`).

### 4. ASO stage dates are race-local midnights — naive UTC conversion is off by one

Stages come stamped like `2026-07-22T00:00:00+02:00`. `new Date(...).toISOString()`
rolls that back to the previous day, which misdated stages and broke our race-day gate
for the live panel. We now keep the authored calendar date verbatim
(`src/features/pro/lib/format.ts:29`).

## Missing / incomplete types

### 5. Image fields are absent from the ASO interfaces

ASO records carry team `logo`, `logo_live`, `jersey`, `jersey_sm`, `color` and rider
`profile`, `profile_sm` URLs on the `img.aso.fr` CDN — all only reachable through the
`[key: string]: unknown` index signature.

### 6. `getCompetitors()` mixes team records into the rider array

Only entries with `$team` are actual riders; every consumer must reimplement this filter.

### 7. `AsoRanking` is just `AsoRecordMeta` — shapeless

The rankings bind varies per edition: single record vs array, rows sometimes nested one
level deep. Our `mapAsoRanking` (`src/features/pro/lib/live.ts:221`) is a heuristic
row-detector every consumer will end up rewriting.

## Data quirks worth documenting

- Team colors: ASO sends `"#000000"` for every team as an unset placeholder.
- Cross-source identity: Tissot standings carry `"VINGEGAARD Jonas"`, ASO startlists
  `firstname`/`lastname`; UCI ids (`TissotRider.uciRiderId`, `AsoCompetitor.UCICode`)
  would be the robust join key.
- Telemetry coverage: only a GPS-tracked sample of the peloton; `YGPW` jersey wearers
  may be untracked.

## Feature wishes

- `getTelemetryForStage(stage)` / frame-selection helper
- `getLatestOverallRanking(competitionId)`
- Typed `getMillesime()`
- Combined "race day status" helper
- `getFile()` returning content type
