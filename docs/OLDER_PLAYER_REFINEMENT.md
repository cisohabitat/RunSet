# Older-player refinement

Baseline ab1f15f: complete CI 40933568072 passed (222 units, 809 browser
cases), matching production READY and eight passing live connected checks.

| Phase | Scope | Status |
|---|---|---|
| 1 | Clearer turn feedback from selection to placement to acceptance | Complete: ed8a0ca, CI 40976555852 and 10 live checks passed |
| 2 | Crowded-table readability and selection/latest-play distinction | Complete: a90f781, CI 40978735493 and 10 live checks passed |
| 3 | Chinese learning, mistake recovery and hints | Implemented; release gates pending |
| 4 | Bot pacing, difficulty consistency, sound and celebrations | Review after Phase 3 gates |

Publish each phase separately to main, update README and AGENTS, and require
quality, every browser job, aggregate check and the direct exact-commit workflow
to finish successfully. Verify matching production READY and connected live
checks before continuing. Preserve existing CI limits, 100000-byte initial gzip
budget, tile dimensions, board floors and bot budgets. Multiplayer and physical
Apple, older-player and native Mandarin studies remain paused.

## Phase 1

The status previously continued to say Choose tiles or draw after selection,
even while the selected-count and highlighted destinations reflected a pending
placement. It now says Choose where to place. Waiting and invalid draft warnings
retain priority; a placement still requires a real reducer change and End turn
remains separate. No new permanent board row is added.

The existing bilingual turn-confidence journey now checks selection, the
translated destination prompt, Escape and exact unchanged saved bytes, retaining
all original placement, Undo, invalid End, timed expiry, read-only Axe and
rearrangement assertions. It runs in main and all offline compatibility profiles.

## Phase 2

Tile markings already differed visually but lacked an accessible explanation
of what each mark meant. More now has a bilingual native Tile markings
disclosure, including how selecting a latest-play tile temporarily replaces its
dot with a check. It does not add board rows, resize tiles or change any state.
Copy stays at 16 px (18 comfortable), with native 44/48 px summary targets.

The 50-table/50-rack crowded journey and fresh connected release journey now
open the key, read every complete translated paragraph inside the actual menu
scroll bounds, close it and verify exact saves, selection and table height.
All prior navigation, placement, Undo, expiry and offline assertions remain.

## Phase 3

Confirmed on production a90f781: selecting red 1 in the first basics step then
clearing with keyboard Escape left zero selected tiles but retained the wrong-
selection tip. The same connected regression failed in both languages before
the fix (expected zero tips, received one).

All Game clear-selection paths now notify the existing lesson callback. This
clears selection-specific tips; engine feedback and storage warnings retain
their own state. Escape, visible deselect and Reset are exercised in the actual
connected beginner journey, followed by all original group/run, opening, draw,
invalid-play recovery and completion steps. Read-only selection changes preserve
the exact lesson save; every step preserves the separate regular save. No lesson
copy, recorded captions, rules, penalty behavior or stored schema changes.

The new strict phone recovery check also exposed a Clear button bottom of
667.1875 in a 667 px viewport after native scrolling. Reset then exposed the same boundary. Deselect and turn-tool controls
now retain 12 px block scroll margin; no smaller targets, epsilon tolerance,
forced taps or repeated scrolling are used. Local main/compatibility browser
suites must run sequentially because their default artifact directories overlap.

Local verification: 222 units, eight existing lesson/turn-confidence checks and
two connected bilingual recovery journeys passed. Production build: 99074 initial
gzip bytes and 77 cache files, with the original budget unchanged.
