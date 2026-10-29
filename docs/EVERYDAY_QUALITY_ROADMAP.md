# Simpler everyday play and stronger game quality

Approved 2026-10-28. Publish each phase separately to GitHub main. Require the
complete exact-commit workflow (quality, all five browser jobs and aggregate
check) before beginning the next phase. Keep default rules, tile/control sizes,
visible table floors, both languages, offline assets and independent save keys.
Multiplayer remains deferred. Physical-device/older-player/native-voice studies
remain paused; automated browsers do not establish their results.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Audit the live release across updates, unfinished turns, lessons and recovery | Complete: 2f7abbf, CI 40786907023 passed |
| 2 | Remove redundant menu actions and make remaining choices easier to scan | Implemented; verification/publication gate applies |
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
