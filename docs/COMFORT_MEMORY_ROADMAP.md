# Learning from play and personal comfort

Approved 2026-10-28. Complete and publish four phases separately to main, requiring
each complete exact-commit CI workflow (quality, every browser job, aggregate
check) to pass before the next phase. Use existing Git/Vercel integration.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Recent public-turn replay | Complete: e0da620, CI 40692437516 passed |
| 2 | Light / Dark / Follow device display choice | Complete: 19572bd, CI 40695653069 passed |
| 3 | Local completed-round history and factual statistics | Complete: 1b607c5, CI 40698781025 passed |
| 4 | Chinese-first fresh opponent names and plain wording | Implemented; final release gate below |

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

Phase 2 exact commit 19572bd568d7d7acb15a221e48d63004f36a5b2b passed
workflow 40695653069: 195 units and 677 browsers (310 Chromium, 104 per
compatibility project, 55 offline), including aggregate check. Matching Vercel
production READY and six live theme journeys passed before Phase 3 began.

## Phase 3

Home (More options on Simple home) and results offer Round history. The optional
local runset.roundHistory.v1 store keeps the latest 30 observed real finishes,
recorded date, round number, literal names, actual computer difficulty and engine
round scores. Displayed counts/wins describe retained records only, not lifetime
or skill. No racks, pools, logs, deadlines or unfinished games are retained.
Previously completed loads/imports and replacements never trigger a record;
StrictMode/reopens are deduplicated. Records are deliberately local-only and
excluded from game backups and portable profiles, as stated in the panel.

History uses its own optional Web Lock and rereads within it; a generation guard
prevents a pre-clear queued finish from resurrecting cleared records. Failed
reads preserve unseen bytes and fail closed against writes; optional failures
never block or alter play. Clear history requires explicit in-panel confirmation
and touches only the history key. Game deletion keeps history separately.

Five regressions cover score conservation/projection, actual finish boundaries,
deduplication/cap, denied reads/writes and queued-clear races. Initial build is
99,567 gzip bytes under the unchanged 100,000-byte budget; 76 precached assets.

Final local Phase 3 verification: all 200 unit tests, ten connected bilingual
history journeys and two Chromium replay regressions passed. Reviewed Chinese
phone and English iPad screenshots. Native hit targets/focus, Axe, literal names,
actual +30/−30 joker scoring, reload deduplication, real downloaded backup plus
delete/import, independent confirmed clearing and first-use offline all passed.

Phase 3 exact commit 1b607c5ddd5c666446ed52ae9796882feae9e40f passed
workflow 40698781025: all 200 units and 687 browsers (312 Chromium, 106 per
compatibility project, 57 offline), plus aggregate check. Matching production
READY and six live history journeys passed before Phase 4 began.

## Phase 4

Only fresh games created at the UI boundary receive Chinese computer names:
电脑阿明, 电脑小兰, 电脑老陈. Names explicitly identify computers. Engine default
names and short-lesson characters/recordings remain unchanged. Switching locale
never renames saved/imported participants; humans named constructor or red 7
remain literal. Fresh restart uses the current locale, while continuing an
existing match keeps its participants. No deal, rack, rule, difficulty or clock
changes accompany naming. Home/setup and new review panels use shorter,
friendlier Chinese wording with the same rule terms and disclosure scope.

The new full-game Axe check exposed an existing inaccessible scrolling rack on
computer turns, when its child tiles are disabled. The rack itself is now
keyboard-focusable only during that wait, with a translated label and native
scrolling; gameplay remains disabled. Retain the explicit computer-start seed
and fixed-date regression so both languages exercise real keyboard scrolling.

All 202 units passed; the existing six Chinese language/learning/save journeys
passed, along with replay/history regressions. Build: 99,663 gzip bytes, unchanged
100,000-byte limit, 76 precached files. Final focused browser and production
checks are recorded with the release gate in COMFORT_MEMORY_RELEASE.md.

Final focused Phase 4 rerun: all ten fresh-name/keyboard-scroll journeys passed
in Chromium, WebKit phone/iPad, Firefox and offline production. Earlier local
runs also passed all replay/history cases after the Chinese copy changes.
The final phase must meet the exact-main CI/24-case live handoff gate documented
in COMFORT_MEMORY_RELEASE.md.
