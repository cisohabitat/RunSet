# Older-player refinement

Baseline ab1f15f: complete CI 40933568072 passed (222 units, 809 browser
cases), matching production READY and eight passing live connected checks.

| Phase | Scope | Status |
|---|---|---|
| 1 | Clearer turn feedback from selection to placement to acceptance | Complete: ed8a0ca, CI 40976555852 and 10 live checks passed |
| 2 | Crowded-table readability and selection/latest-play distinction | Implemented; release gates pending |
| 3 | Chinese learning, mistake recovery and hints | Review after Phase 2 gates |
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
