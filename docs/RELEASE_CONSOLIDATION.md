# Release consolidation

Phase 4 follows the completed crowded-board release 5544cee (full CI
40919262335: 222 units, 801 browser cases; matching production READY and
14 live checks). Multiplayer and physical Apple/older-player/native Mandarin
studies remain paused.

## Demonstrated findings and changes

- The 375 px playing wordmark extended outside its Home button, while the Results
  header crowded its controls. Keep the brand from shrinking and allow non-game
  headers to wrap. At 320 px during play the labelled 44 px tile-logo Home control
  saves space. All other controls remain available.
- Chinese More measured 40 px wide in the standard compact toolbar. All compact
  turn tools now retain at least 44 px inline targets.
- In comfortable reading the full-height menu covered its own toggle. Add a
  visible translated sticky Close menu button, return focus to the opener and
  retain Escape. Native scrolling has clearance below the sticky exit.
- At 320 px, a shrinking context clipped the heading's bottom. A 44 px minimum
  context preserves its full bounds; the table still meets its original floor.

## Connected verification

The bilingual journey starts with empty storage and completes the actual basics
lesson: group, run, opening, bot turn, draw and invalid-move recovery. It exits to
a new default Easy game, accepts the real random deal, checks all 106 IDs, makes
a draft, takes a break, reloads, resumes and undoes it while checking exact saves.

A separate constructed near-win control is imported through the native file
chooser and confirmation. Actual tile placement and End turn produce Results
and one history entry. This establishes the ending/import connection, not a
fully played round from the preceding fresh deal. Results are checked at 320,
375, 390, 820, 1180 and 1440 px, in standard and comfortable reading. Header
controls retain native targets, full bounds, centre hits, non-overlap, focus
return and exact read-only saves. Switching language preserves state. Runtime
errors and accessibility violations fail the journey.

The two cases run in main Chromium and all three offline compatibility projects:
WebKit phone, WebKit iPad and Firefox desktop. Expected full totals are 222 units
and 809 browser cases, including both unchanged offline shards. Existing job
20-minute and offline step 5-minute limits, 100000-byte initial gzip budget,
tile dimensions, table floors and bot budgets remain unchanged.

## Release gate and reproduction

Run npm run build, then npx playwright test --config=playwright.release.config.ts.
The read-only Release review workflow repeats the eight connected checks and
captures selected CI screenshots. Its isolated-branch run 40929542538 passed
all four profiles before final scroll-clearance and menu-order regression work.
It is supplemental; require the final commit's full quality, six browser jobs
and aggregate check, with the direct workflow run completed successfully.

After publishing main and observing matching production READY, create a branch
codex/live-release-review/<short-main-SHA> from that exact commit. Its create
event runs the same eight checks against https://run-set.vercel.app. Manual
workflow dispatch with production=true is an alternative. The workflow does
not deploy or promote anything and receives only contents:read permission.

Local shell access recovered after an executor interruption; outbound Git from
the shell remained unavailable. GitHub connectors preserve expected-SHA leases
for publication. Browser CI and live runs provide release evidence; emulated
WebKit does not establish physical-device behavior or older-player usability.
