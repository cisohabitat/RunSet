# Simpler everyday play and stronger game quality

Approved 2026-10-28. Publish each phase separately to GitHub main. Require the
complete exact-commit workflow (quality, every browser matrix job and aggregate
check) before beginning the next phase. Keep default rules, tile/control sizes,
visible table floors, both languages, offline assets and independent save keys.
Multiplayer remains deferred. Physical-device/older-player/native-voice studies
remain paused; automated browsers do not establish their results.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Audit the live release across updates, unfinished turns, lessons and recovery | Complete: 2f7abbf, CI 40786907023 passed |
| 2 | Remove redundant menu actions and make remaining choices easier to scan | Complete: 4115285, CI 40792273244 passed |
| 3 | Improve Mandarin rule comprehension with concrete opening/joker examples | Complete: d39971d, CI 40797539848 passed |
| 4 | Evaluate bot quality on a larger balanced unseen set before any tuning | Complete: 7139574, CI 40801453106 passed |
| 5 | Stress real browser sessions, background/resume, rotation and storage recovery | Implemented; complete publication CI required |

## Phase 1 — live release audit

Baseline: 9f12288, complete CI 40737157053 (204 units, 737 browser cases).
Vercel's matching deployment is READY. The previous polish roadmap's pending
live acceptance can now be checked against the actual production assets.

Trace Continue → unfinished draft → update check → failure/offline reload → Undo;
learning → actual accepted lesson turns; regular play → actual finish → downloaded
backup → delete/import/reload. Check both English/light and Chinese/comfortable/
dark through WebKit phone, WebKit iPad and Firefox desktop. Reuse the connected
update-check, turn-lessons, player-comfort-release and visual-consistency journeys.
They retain native targets/focus, actual storage bytes, original deadlines,
physical tile validity, accessibility and runtime-error assertions. Local real
worker recovery tests separately exercise failed saves and late activation edits.

All 24 production cases passed (eight per browser, both languages), with no
runtime-error or accessibility failures. Actual drafts, deadlines, lesson
completion, downloaded backup/import and offline reload checks passed. All four
local real-worker recovery cases passed too. Reviewed Chinese phone update
feedback and iPad completed-turn review captures. No application fix was needed
for this audit. This is automated Linux browser/viewport evidence, not a physical
Apple session, audible Mandarin approval or an older-player comprehension study.

## Phase 2 — less interface clutter

Audit duplicated actions and labels in the header and game menu. Keep common
destinations direct, destructive actions explicit/confirmed, and secondary tools
reachable without adding more disclosure layers. Preserve safe navigation,
selection, timed drafts, beginner help and minimum physical targets. Measure the
actual open menu as well as the unchanged populated board; do not shrink tiles.

Full and Simple Home now retain one rules action each. The duplicate Home footer
action and rules-page self-link are omitted. Clicking the latter previously
could replace helpBack with help, making Back return to the rules page itself.
Other screens keep their footer shortcut. Game menu
offers Practice · keep this game first, shorter Restart game wording with the
original same-player replacement confirmation, and explicit Delete saved game
last. The menu Settings shortcut is retained: comfortable phone menus can cover
the header, so removing it would make that destination harder to reach.

Screenshot review measured tiny 12 px standard menu copy and retained scroll
after reopening. Menu copy now uses 16 px (18 px comfortable), with >=48 px
controls. Reopening resets the menu's own scroll to the first choices, without
focus/state changes; nested disclosures retain their own position. All changes
are inside existing menus/footer, with no new board row or smaller tiles.
Build: 98,617 initial gzip bytes, unchanged 100,000 budget; 77 cache files.

The connected bilingual menu journey traverses both Home variants, rules/Back,
native restart/delete cancellation, menu Settings, independent practice, reload
and first-use offline assets. Exact timed-draft bytes stay unchanged. It measures
16/18 px action text and >=48 px targets, requires first choices on reopening,
and preserves scroll while a nested backup-help disclosure opens. The reset is
guarded to the root details' own toggle event, not bubbled child toggles.

All 204 units and 15 broader Chromium gameplay/language cases passed. All ten
final menu cases passed across main, compatibility and offline. The broader
compatibility/contrast run passed 50 cases; one Firefox process exited with
Juggler/browser errors (no application assertion failure), so that unchanged
case is rechecked separately. Require fresh complete exact-commit CI after push.

The unchanged Firefox contrast recheck passed. A final capture exposed the old
backup-button font override; scoped inheritance now gives those controls the
same readable menu size. The connected journey measures every accessible menu
button, not only direct actions, and retains the nested-scroll/rules-Back checks.
All ten final target/text journeys passed. Native file-upload checks measure the
visible forwarding label (48 px), rather than the transparent input's 46 px inner
box or unused font. The original target and readable-text minima remain intact.

The first publication c0eb90e failed main CI 40790415506: all four full-screen
accessibility audits still clicked the removed Home footer button. They timed
out at that stale selector; 319 other Chromium cases and every other browser
job passed, including all 70 offline cases in 4.9 minutes. The correction uses
the retained single Home How to play action. No audit, assertion, timeout or
application behavior is removed/changed. Require the fresh correction's complete
workflow before Phase 3; the failed publication is not the final acceptance gate.
All ten corrected accessibility cases passed locally, including four complete
language/theme audits, keyboard play and 320 px reflow. Application source and
its 98,617-byte build remain unchanged by this selector correction.

## Phase 3 — Mandarin comprehension

Audit dense rule copy and real examples for first opening and joker retrieval/
reuse. Show simple arithmetic and a complete legal before/after example without
changing the engine rules or literal player names. Preserve exact recorded lesson
captions; do not imply native Mandarin review or new recordings. Verify both
languages, readable phone/tablet bounds and first-use offline access.

Rules now offer native expandable opening and joker examples. Two complete
groups (three 8s and three 2s) show 24 + 6 = 30 from the rack alone. The joker
sequence shows red 4/joker/red 6, replacing with the actual rack red 5, then
reusing that joker beside red 7/8 in the same turn. Its represented value becomes
9. Short Chinese steps accompany every before/after figure. Existing abstract
rules, missing-colour priority and exact recorded lesson captions are retained.

Canonical diagram IDs are shared with three engine-validation tests: accepted
combined opening, rejected 24-only opening, and actual accepted joker replacement/
reuse. The new native journey checks every displayed physical ID, disabled
read-only tiles, readable captions, target geometry, portrait/landscape rotation,
full horizontal bounds, Axe and exact saved bytes through Back/reload.

All 207 units passed. Initial browser checks caught the global comfortable
supporting-caption rule overriding the new 18 px captions; the rules-specific
selector now wins, with the strict readability assertion retained. Build:
98,691 initial gzip bytes under the unchanged 100,000 budget, 77 cache files.
All compatibility example journeys disconnect before first use. Extra production
Chromium checks use a temporary local config; no existing offline coverage or
five-minute CI limit is removed to accommodate new interaction tests.
All ten final example journeys passed: two main Chromium, six production
compatibility, and two additional production Chromium offline checks. Six existing
language cases also passed in the broader run. Readable Chinese phone and English
iPad opening figures were reviewed; native diagrams retain the original game
bytes and deadline through rotation and Back/reload. The new rules content is
automated text/diagram evidence, not native Mandarin or older-player acceptance.
Four additional WebKit phone/iPad captures passed with complete joker figures;
reviewed both languages' replacement/reuse sequence as well as the opening math.

Publication47c4e0 / CI40795173882 failed its offline watchdog after all70 cases
reported passed at5.0 minutes; runner completion crossed the five-minute step.
The new example cases were not added to that job. Keep all70 existing cases and
the watchdog by splitting into two Playwright shards in independent CI jobs.
Original offline runs1/2; new offline-2 runs2/2. Both retain their five-minute
test step, twenty-minute job, complete dependency/audio setup and unique failure
artifacts, and the aggregate check requires the entire matrix. No test, assertion
or failure artifact is removed. List verification proves35+35 cases, disjoint,
with exactly the full70-case union. Local shard runs remain sequential because
their worker fixtures share dist/sw.js; parallel CI jobs have separate builds.
Require a fresh complete correction workflow before Phase4.
Every other job on47c4e0 passed: quality, all325 Chromium cases and all120 cases
in each compatibility project. The offline failure was solely the elapsed step
watchdog, after all70 cases reported passed; it is still a failed gate.
Local partition verification passed with no omissions/duplicates. Shard1 passed
all35 cases in2.6 minutes; shard2 passed all35 cases separately. Application
source/build and all original offline assertions remain unchanged by sharding.

The correction d39971d passed complete CI 40797539848: quality, all six browser
jobs and aggregate check. Six live example journeys also passed against READY
47c4e0, whose application assets are identical to the workflow-only correction.
Phase 4 began only after the complete correction workflow succeeded.

## Phase 4 — evidence before bot tuning

Use a larger unseen seed block than the prior two-deal review, all six mixed
seat assignments and both orders of every pair, at the production 380 ms request
budget. Retain raw reports, fingerprints, seed blocks, actual submitted-plan
legality, conservation, endings/ties and full-call latency. Inspect missed legal
finishes and opening opportunities; never infer a missing legal move from Draw.
Correct any demonstrated defect with a separate tactical regression. Do not tune
to sampled wins, invent a skill ranking or change default difficulty speculatively.

Completed 60 mixed and 60 paired rounds across ten previously unseen seed blocks
per format, at the production budget, sequentially on one host. All original
proposals and 5,153 validated Normal baselines were legal; physical IDs, input
immutability and per-round action/rack accounting passed. No known opening was
missed. One known Normal rack-empty finish was available to Hard, and taken;
mixed supplied none. Maximum actual call was 244.68 ms; zero exceeded 400 ms.
The 115 blocked endings limit finish coverage and warrant future independent
endgame fixtures, not tuning to these wins. Strategies and Easy default remain
unchanged. See [full review and raw evidence](EVERYDAY_BOTS_REVIEW.md).

Publication 7139574 passed complete CI 40801453106: quality, all six browser
jobs and aggregate check. Its Git-linked Vercel deployment is READY. All 207
units and the 98,691-byte production build passed locally before publication.
Phase 5 began only after that complete workflow succeeded.

## Phase 5 — long browser sessions

Exercise repeated real browser actions with bounded Undo, timed/untimed state,
background/resume, orientation changes and storage failures. Retain exact saved
drafts, original deadlines, explicit reload/recovery and 106 physical IDs. Record
browser timing/resource samples honestly, separate warm-up from repeated work,
and keep bounded cleanup. Reuse existing engine soaks; browser sessions complement
them and do not establish physical-device battery life or older-player usability.

All 16 new primary browser cases passed, plus four additional offline production
Chromium cases, 13 existing landscape/table-overview cases and all 207 units.
Sessions retain 100 Undo copies through 121 real edits, selection/rotation,
write refusal/retry, reload/Undo, exactly-once expiry after logical Home time and
three actual completed rounds per untimed case. Chromium records retained heap /
DOM and a separate native freeze/resume; positive heap growth stays within the
smoke bound, without a physical-device or indefinite leak-freedom claim.

The new journeys caught Firefox's sticky decorative heading covering the first
meld destination after native scrolling. The regular heading now scrolls with
melds, and both formerly failing cases pass their unchanged hit tests. All tile,
control and table minima remain intact. Build: 98,703 gzip bytes / 77 cache files.
See [review, raw samples and reproduction](EVERYDAY_SESSION_REVIEW.md). Publish
separately and require complete exact-commit CI before final handoff.

Initial d0fe8f6 / CI 40804829556 failed one new main-browser More target probe
after Chinese reload/Undo; every other case/job passed, and aggregate check
correctly failed. The correction awaits visible Saved UI and complete unchanged
native geometry, with no scrolling inside the measurement poll, relaxed bound,
larger timeout or application change. Require the correction's full workflow;
the initial failed gate is not final acceptance. The 12 live cases passed on
matching READY d0fe8f6 with identical application assets.
All eight corrected bundled-Chromium cases passed locally (both languages/timer
modes, twice, two concurrent workers), preserving the resource and state checks.

Readiness-only d7d024b / CI 40807269770 still failed the same target after five
seconds, with every other case/job green. Snapshot replay with wider fallback
metrics identified native fractional scroll rounding: bottom667.40625 in a667 px
viewport. A12 px More scroll margin yields bottom655.40625 without changing its
dimensions. The actual application correction retains strict full bounds and
adds Chinese untimed fallback-font coverage on every reload. Current build:
98,708 gzip bytes, 77 cache files. Fresh complete CI remains required.
All eight margin-corrected local bundled-Chromium cases passed, including both
Chinese fallback-font repeats, with the full geometry requirements unchanged.
All 12 offline compatibility cases passed on the same margin/fallback correction.
