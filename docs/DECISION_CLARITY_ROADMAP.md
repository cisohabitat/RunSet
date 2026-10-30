# Easier decisions and solo play

Approved follow-up to the completed [visual/ease cycle](VISUAL_EASE_ROADMAP.md).
Baseline `aa83616dd6f5ccc5f1ceb12fa145d57adc0f6c75`: full CI 41069807759
passed (223 unit / 859 browser tests), matching READY production and 24 live
checks passed in 41072105921. This is automated evidence; physical-device,
older-player and native Mandarin listening studies remain paused. Multiplayer
remains deferred.

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Simpler decisions: review busy turns and clear next actions using existing space | Implemented; its own full exact-commit CI and matching live gate required |
| 2 | Plain-language mistake recovery with concrete corrections and visible Undo/Reset | Planned |
| 3 | Review Easy-bot pacing, repetitive draws and difficulty jumps using recorded evidence | Planned |
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
