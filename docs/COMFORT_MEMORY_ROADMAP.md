# Learning from play and personal comfort

Approved 2026-10-28. Complete and publish four phases separately to main, requiring
each complete exact-commit CI workflow (quality, every browser job, aggregate
check) to pass before the next phase. Use existing Git/Vercel integration.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Recent public-turn replay | Complete: e0da620, CI 40692437516 passed |
| 2 | Light / Dark / Follow device display choice | Published; exact-commit CI pending |
| 3 | Local completed-round history and factual statistics | Pending |
| 4 | Chinese-first fresh opponent names and plain wording | Pending |

Physical older-player/device study stays paused. Native Mandarin listening and
battery acceptance remain unverified. Multiplayer remains deferred.

## Phase 1

More → Help with this turn and results offer Replay recent turns. It records up
to six completed public turns during the current page visit, retaining frames
across Home navigation. Reloading, replacement and fresh games clear the replay.
This scope is explicit in the panel. No new storage key or save/profile schema.

Frames contain turn number, literal actor, original public turn-start board,
completed public board and added public IDs only. No hidden rack/pool allocation,
clocks, scores or private logs. No intermediate edit order or bot intent is
invented. Before/After and Previous/Next controls are explicit; no autoplay.
Regular game state and selection stay mounted and unchanged; actual deadlines
continue and turn/state replacement closes the stale dialog. Native opener focus
and guarded WebKit retry are retained. Replay CSS/component stay lazy/precached.

Four projection/ring regressions plus translation audit passed. The initial
browser journeys cover a real human turn, actual bot handoff, before/after,
selection/save/deadline invariance, native targets/focus, Axe, final winning turn,
expiry and reload clearing. Final build initial gzip: 99,300 bytes under the
unchanged 100,000-byte budget; 73 precached files.

Local verification: all 194 unit tests and ten bilingual browser journeys passed
across Chromium, WebKit phone/iPad, Firefox and offline production. Phone Chinese
and iPad English screenshots reviewed: controls and public boards remain legible.
Publication is gated on the complete exact-commit GitHub Actions workflow before
Phase 2 begins.

Phase 1 exact commit e0da620e8fb11362d0368687bfc21c2813a313ac passed
workflow 40692437516 (quality, all five browser jobs and aggregate check).
Matching Vercel production READY; all six bilingual live compatibility journeys
passed before Phase 2 started.

## Phase 2

Settings → Reading and display offers Light, Dark and Follow device. The default
follows the OS and responds to changes while open. Explicit choices override the
OS, including native controls, gameplay surfaces and the high-contrast palette.
The independent runset.theme enum is retained through game deletion and included
in validated portable profiles with meaningful labels. Invalid/unreadable choices
fall back to Follow device. A denied optional write explains visit-only behavior.
No game remount, saved bytes, selected tiles, draft or deadlines change.

The initial local test caught a short native selector in standard reading mode;
its minimum is now 48 px. All 195 unit tests passed. Build initial gzip is 99,489
bytes under the unchanged 100,000-byte limit; all 73 assets remain precached.

Final local Phase 2 browser verification: ten theme journeys plus all 39 existing
compatibility contrast journeys passed. Reviewed phone English and iPad Chinese
settings screenshots. All exact draft/save/deadline checks, reload/delete retention,
failed optional writes, native target/focus and first-use offline checks passed.
