# Easier decisions and solo play

Approved follow-up to the completed [visual/ease cycle](VISUAL_EASE_ROADMAP.md).
Baseline `aa83616dd6f5ccc5f1ceb12fa145d57adc0f6c75`: full CI 41069807759
passed (223 unit / 859 browser tests), matching READY production and 24 live
checks passed in 41072105921. This is automated evidence; physical-device,
older-player and native Mandarin listening studies remain paused. Multiplayer
remains deferred.

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Simpler decisions: review busy turns and clear next actions using existing space | Complete: 2988d56, CI 41080709747 and 32 matching live checks in 41083235984 passed |
| 2 | Plain-language mistake recovery with concrete corrections and visible Undo/Reset | Complete: 1b41fc7, CI 41094208501 and 40 matching live checks in 41096842874 passed |
| 3 | Review Easy-bot pacing, repetitive draws and difficulty jumps using recorded evidence | Review and guidance implemented; exact-commit full CI and live gate required |
| 4 | Crowded-board selection and feedback review across phone, iPad landscape and desktop | Planned |

Publish separately, update README and AGENTS, then pass full twelve-job CI and
matching production/live checks before beginning the next phase. Preserve the
100000-byte initial gzip budget, tile sizes, native targets, board floors,
engine rules, saved deadlines and bot budgets. Change behavior only for a
reproduced problem; a review does not require changing strategies or layout.

## Phase 1: locked table selections before opening

On a busy table a player who has not opened can select public tiles. The old
status said Choose where to place, and coaching said to select more tiles or
use New group or run to build in steps. The reducer rejects that route until
the rack-only opening is accepted. A new regression failed on this exact generic
instruction before the fix, with both a fresh and a ready-to-accept opening.

The existing status now says Open with rack tiles for a selection containing
original public tiles. English and Chinese coaching explain clearing selection
and using rack tiles first. Once a valid opening is ready, the instruction is
Clear selection, then End turn, followed by why public tiles remain locked.
The compact copy fits the existing coaching card. It says Clear selection so it
also makes sense alongside the phone's Clear control and desktop's Deselect all.
Chinese uses the existing 取消选择 terminology.

The check uses turn-start public tiles, not every tile currently on the table:
tiles just placed from this rack remain editable before accepting the opening.
Mixed rack/public selections receive the same explanation. Existing unfinished-
turn warnings and opponent-waiting states retain priority. Selection and guidance
remain read-only; there is no engine dispatch, planner call or persistence change.
No additional panel, CSS change, tile reduction or permanent board row is added.
Lesson captions and recordings are unchanged.

## Verification scope

The new bilingual native-control journey starts with six public melds and a
crowded rack, checks original and mixed selections, actual Clear/Deselect and
Escape, exact saved bytes and deadline, then builds a real 36-point opening.
It waits for the expected reducer state and Saved before capturing the edited
checkpoint, checks the ready instruction, confirms own-draft tiles stay editable,
and actually accepts End turn. The resulting opened state and full table/rack
must match the reducer; runtime errors fail the case.

The journey checks complete coaching-copy bounds and unchanged 44 px native
controls using real hit tests at phone/tablet profile sizes and 1440×900. English
standard/light and Chinese comfortable/dark screenshots are reviewed. New cases
run in main Chromium and all three offline compatibility profiles. They also
extend the production review; all original 24 connected live cases remain.
Expected totals: 224 unit tests, 867 browser cases (343 main, 138 per compatibility
profile, 70 offline, 40 upgrades), and 32 live cases (eight per profile).
The twelve required CI jobs, their 20-minute limits and five-minute offline
steps are unchanged. Local WebKit remains unavailable due to missing host
libraries; the provisioned CI matrix supplies that coverage. No local sandbox
exception belongs in repository configuration.

Local acceptance passed all 224 units, both new native Chromium journeys, six
existing guidance/turn-status flows, four offline Firefox opening/turn-status
journeys, and the expanded eight-case Chromium and Firefox release reviews.
Final guidance/translation checks also passed after the copy review. The final
build measured 99341 initial gzip bytes and 77 precached files. Local Markdown
links and diff whitespace checks passed. Full exact-commit CI and matching READY
production with all 32 live cases remain required before reporting this phase
released; local browser automation does not establish human/device acceptance.


## Phase 2: clear corrections and reachable recovery controls

Baseline `2988d5699ac3c4f30dca6dda9c206671f5dddbf7` passed all twelve CI jobs
in 41080709747 (224 unit / 867 browser tests) and all 32 matching live checks
in 41083235984, with matching production READY. This completes Phase 1; its
implementation-time gate notes above are historical.

Blocked-opening help retained selected table tiles but only said to choose rack
tiles. Tapping a rack tile adds it to that retained selection, so another attempt
still includes locked public tiles. The correction now explicitly begins with
Clear selection in both languages. The regression follows that advice through
actual Clear, rack-only placement and the correct remaining-opening-points help.

The Move help dialog lacked a direct route to Undo or Reset. It now explains
one-move Undo versus whole-turn penalty-free Reset, with Find Undo and Find Reset
controls. They close the dialog and More, then focus and reveal the actual turn
control. Finding is read-only: the next explicit native activation performs the
recovery. Missing/empty legacy history offers Reset without promising Undo.
Existing Back/Escape/focus restoration and Find affected tiles remain intact.
Phone screenshots showed four narrow action columns with three-line labels.
Only this dialog's footer now uses two columns below 540 px; an odd final exit
spans both columns. Main-board tile dimensions, native targets and floors stay.

A two-joker regression also failed: the help listed both original jokers when
only the second needed repair, so Find affected tiles focused the unchanged first
joker. The validator's existing replacement/reuse check is extracted unchanged
as unresolvedJokers and shared by help. The affected list excludes unchanged and
correctly replaced/reused jokers. There is no rule, strategy, save-schema or bot
budget change; the original End-turn reason and validation order are preserved.

Strict Firefox bounds caught the final Chinese paragraph ending at 546.0000305
inside a scroll area ending at 546 px. The help body now has 12 px end padding
and paragraph scroll margin. Geometry assertions keep exact full bounds; no
rounding tolerance, forced action or timeout increase is used.

The new bilingual journey exercises the real two-joker error, affected-tile
finder, read-only action finders, native Undo, Reset across two actual moves,
legacy missing history, and blocked-opening correction. Checkpoints wait for
both exact expected reducer state and Saved. All paragraph bounds, footer target
sizes/centre hits, accessible modal checks, exact saved bytes and deadline remain
asserted. It runs in main Chromium, all three offline compatibility profiles and
matching production. All prior cases remain: expected totals are 225 unit tests,
875 browser cases (345 main, 140 per compatibility profile, 70 offline and 40
upgrades) and 40 live cases (ten per profile). Full twelve-job CI and exact-SHA
READY production/live acceptance remain the gate. Physical-device and human
Mandarin/older-player acceptance remain paused.

Local Phase 2 acceptance: all 225 units passed, with 30 focused rule/help/
translation checks passing after the final validator assertions. Both final
phone journeys preserved a selected rack tile through read-only finders. The
full configured Chromium and Firefox release reviews each passed ten cases.
An initial isolated Firefox run missed native More activation; no input/profile
workaround was added, and the full configured review retained native menu/focus
assertions. An overlapping local browser run invalidated some shared traces;
final reviews ran sequentially. Phone footer screenshots were inspected in both
languages after the two-column change. Final build: 99423 initial gzip bytes,
77 precached files. Local Markdown links and whitespace checks passed. Local
WebKit remains unavailable due to host libraries; complete provisioned CI and
matching live acceptance are still required before reporting Phase 2 released.


## Phase 3: Easy draws, pacing and difficulty

The [solo pacing review](SOLO_PACING_REVIEW.md) records 48 fresh ordinary-deal
rounds and 5190 turns, their fingerprints, raw traces, independent accounting
checks, bounded witnesses and limits. All original proposals were legal and no
witnessed opening was missed. All 1061 known Normal alternatives during Easy's
post-opening draws used extensions outside Easy's style. Strategies, defaults,
rules and budgets stay unchanged; optional bilingual opponent help now explains
why repeated Easy draws and a slower/faster pace are separate choices.

New native-worker journeys verify all four waits, actual accepted human/bot
openings, Settings cancellation and exact save/deadline preservation. They run
in main, all three offline compatibility profiles and the expanded 48-case live
review, retaining every earlier case and original CI/geometry limits. See the
review for expected counts, clock-fixture corrections and verification limits.
Phase 2 is complete at 1b41fc7 with all twelve CI jobs and matching production/
live acceptance passed; its implementation-time gate notes above are historical.
This new Phase 3 publication requires its own full exact-commit gate.
