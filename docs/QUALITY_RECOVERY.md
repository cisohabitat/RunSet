# Performance and recovery audit

The third follow-up phase preserves rules, tile sizes and save formats while
addressing interrupted saves, failed lazy screens and offline updates.

## Verified defects and fixes

- A rejected Web Locks request could reject the save promise and leave callers
  waiting. Writes now resolve with a storage failure, preserve the previous save
  and allow a later successful retry.
- A failed lazy screen could replace the game with an unhandled render error.
  A bilingual recovery screen retains App-owned game state, pauses bot callbacks,
  offers Home and saves the latest position before reloading. A refused write
  keeps the page open. Leaving recovery cancels its pending reload. Timers retain
  their existing running behavior, stated visibly.
- Offline activation chose a previous cache by creation order, allowing an empty
  failed installation to displace the working version. Failed new installs are
  cleaned up; activation retains the latest previous cache containing index.html.
  This checks a usable installation marker, not every possible corruption of an
  older cache. Current-version offline readiness still verifies every asset.

Updates prevent duplicate activation requests, report installation/activation
failures, clean up listeners, and check the latest save both before activation
and again before reload. A move made during activation cannot be discarded by
an automatic reload; refused writes leave a retry action and the previous save.

## Crowded boards and long sessions

Tiles are memoized with stable focus/drag callbacks. Save validation reuses an
active-ID Set instead of repeatedly scanning the inventory. Locale changes
still update labels through context. No tile or hit-target dimensions changed.

Retained Chromium measurements use 50 table tiles, 50 rack tiles, 100 Undo
snapshots and 4× CPU throttling, English/Chinese at 390 and 1180 px. Each case
contains ten move/Undo render samples, measured from click capture to the second
animation frame. These are small browser smoke samples, not physical-device
latency or a population percentile.

| Stage | Largest observed sample across four cases |
| --- | ---: |
| [Baseline](QUALITY_PERFORMANCE_BASELINE.json) | 423.8 ms |
| [Tile memoization](QUALITY_PERFORMANCE_MEMO.json) | 393.8 ms |
| [Memoization and inventory Set](QUALITY_PERFORMANCE.json) | 347.6 ms |
| [Separate coarse-pointer verification](QUALITY_PERFORMANCE_TOUCH.json) | 325.5 ms |

Observed medians improved across the baseline/final mouse-layout cases, but
intermediate maxima were noisy: the English phone maximum increased from 382.9
to 393.8 ms after memoization alone. Touch results are separate verification,
not a direct baseline comparison. The regression gate is a broad 1000 ms bound.
Rack selection uses clicks; move/Undo use taps in the coarse-pointer cases.
Reports retain samples, browser version and source fingerprints.

The new engine soak executes 1000 conserved turns across 15 rounds, validates
every save, checks planner input immutability and round-trips ten backups.

## Coverage and release gate

Ten recovery browser flows cover both languages, failed Game/Settings downloads,
Axe checks, refused saves and retry, closing a tab during a locked write, paused
bots and cancellation of a pending reload. Four crowded-board flows cover
placement/Undo, saved inventory, page bounds and runtime errors.

Four new production-offline flows cover an actual failed asset precache,
retention of the previous working cache despite an empty newer cache, refused
update saves, and a real move plus locked write during activation. Together with
existing suites the configured totals are 114 unit tests, 199 browser flows and
17 production-offline flows. Exact-commit GitHub CI is the publication gate.

Physical iPhone/iPad Safari, older-player studies and native Mandarin listening
remain paused. Automated Axe checks do not establish full WCAG conformance.

Local release checks passed: strict TypeScript, all 114 unit tests, 32 affected
browser flows followed by all ten final recovery flows, all 17 production-offline
flows, and the production build at 98,828 initial gzipped bytes against 100,000.
Recovery screenshots were inspected in English/light and Chinese/dark at 375×667.
The four retained coarse-pointer performance cases passed separately.
