# design-sync notes — festi UI

Synced `src/components/ui/` (shadcn, style `radix-nova`) to Claude Design project
**Festi UI** (`90d983d0-9610-4d3f-a7c1-d2cdcaf36a89`). First sync: 2026-10-02.

## Repo-specific setup (this is an app, not a published library)

- **No `dist` / not a published package.** The converter runs in **synth-entry mode**
  from `src/components/ui` (`cfg.srcDir`). To make `PKG_DIR` resolve to the repo root,
  a self-symlink is required: `ln -sfn .. node_modules/festi` (gitignored; recreate on
  a fresh clone before building).
- **`cfg.srcDir` is scoped to `src/components/ui`** on purpose — it keeps discovery to
  the shadcn layer. Widening it pulls in app components that import Prisma/auth/next and
  will not bundle.
- **168 exports** = the shadcn compound parts (Card→CardHeader…, DropdownMenu→~15, etc.).
  All ship importable on `window.FestiUI`. 30 top-level components have authored previews
  in `.design-sync/previews/`; the rest are honest floor cards.

## CSS / Tailwind (critical)

- Styling is **Tailwind v4 utility classes** that only exist after compilation. `cfg.cssEntry`
  points at **`.design-sync/compiled.css`** (a build artifact, gitignored). Regenerate it
  before every build:
  ```sh
  ./.ds-sync/node_modules/.bin/tailwindcss -i .design-sync/ds-input.css -o .design-sync/compiled.css
  ```
  `ds-input.css` (committed) wraps `src/app/globals.css` and adds the brand font (below).
- **Brand font Raleway** is injected by `next/font` at runtime (`--font-raleway`), so it is
  NOT in the bundle and components fall back to serif. `ds-input.css` ships it via a Google
  Fonts `@import` + a `--font-raleway` definition. Validate reports `[FONT_REMOTE]` for it —
  expected, loads at runtime (needs network in the capture environment).
- festi is **dark-themed by default** (`:root` = dark). Previews are wrapped in a brand
  surface via `cfg.provider` → `FestiThemeRoot` (`.design-sync/theme-root.tsx`, added through
  `cfg.extraEntries`) so components render `bg-background text-foreground`. Without it,
  surface-less components (Table, plain text) render invisible white-on-white.

## Known floor cards / skips

- **ChartContainer**: Recharts `ResponsiveContainer` measures 0 in static headless capture
  (ResizeObserver fires after the screenshot) → left as a floor card. Still importable.
- **Toaster** (sonner): nothing renders without a live toast → floor card by design.

## Known render warns (triaged, not new)

- `[RENDER_BLANK]` on atomic sub-parts (TableCell, SidebarFooter, AlertDialogFooter, etc.):
  expected — they render nothing meaningful alone; they are composed inside parent previews.

## Re-sync risks (watch-list)

- **compiled.css is regenerated, not committed** — if the Tailwind step is skipped, the build
  uses a stale/missing stylesheet. Always recompile first (command above).
- **Raleway via remote @import** — if the capture host is offline, previews fall back to serif;
  the uploaded bundle still carries the `@import` so real designs are fine.
- **Playwright pin**: cached chromium is build 1243 (Chrome 153). `playwright@1.63.0` matches it.
  A different cached build needs the matching playwright release.
- **Self-symlink `node_modules/festi`** must exist before building on a fresh clone.
- Preview APIs track this repo's shadcn version; a shadcn upgrade may change compound part
  names — re-verify the authored previews after any `src/components/ui` change.
