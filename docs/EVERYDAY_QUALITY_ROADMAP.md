# Simpler everyday play and stronger game quality

Approved 2026-10-28. Publish each phase separately to GitHub main. Require the
complete exact-commit workflow (quality, all five browser jobs and aggregate
check) before beginning the next phase. Keep default rules, tile/control sizes,
visible table floors, both languages, offline assets and independent save keys.
Multiplayer remains deferred. Physical-device/older-player/native-voice studies
remain paused; automated browsers do not establish their results.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Audit the live release across updates, unfinished turns, lessons and recovery | 24 live and 4 worker-recovery cases passed; publication CI required |
| 2 | Remove redundant menu actions and make remaining choices easier to scan | Pending |
| 3 | Improve Mandarin rule comprehension with concrete opening/joker examples | Pending |
| 4 | Evaluate bot quality on a larger balanced unseen set before any tuning | Pending |
| 5 | Stress real browser sessions, background/resume, rotation and storage recovery | Pending |

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

## Phase 3 — Mandarin comprehension

Audit dense rule copy and real examples for first opening and joker retrieval/
reuse. Show simple arithmetic and a complete legal before/after example without
changing the engine rules or literal player names. Preserve exact recorded lesson
captions; do not imply native Mandarin review or new recordings. Verify both
languages, readable phone/tablet bounds and first-use offline access.

## Phase 4 — evidence before bot tuning

Use a larger unseen seed block than the prior two-deal review, all six mixed
seat assignments and both orders of every pair, at the production 380 ms request
budget. Retain raw reports, fingerprints, seed blocks, actual submitted-plan
legality, conservation, endings/ties and full-call latency. Inspect missed legal
finishes and opening opportunities; never infer a missing legal move from Draw.
Correct any demonstrated defect with a separate tactical regression. Do not tune
to sampled wins, invent a skill ranking or change default difficulty speculatively.

## Phase 5 — long browser sessions

Exercise repeated real browser actions with bounded Undo, timed/untimed state,
background/resume, orientation changes and storage failures. Retain exact saved
drafts, original deadlines, explicit reload/recovery and 106 physical IDs. Record
browser timing/resource samples honestly, separate warm-up from repeated work,
and keep bounded cleanup. Reuse existing engine soaks; browser sessions complement
them and do not establish physical-device battery life or older-player usability.
