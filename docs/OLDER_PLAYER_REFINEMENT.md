# Older-player refinement

Baseline ab1f15f: complete CI 40933568072 passed (222 units, 809 browser
cases), matching production READY and eight passing live connected checks.

| Phase | Scope | Status |
|---|---|---|
| 1 | Clearer turn feedback from selection to placement to acceptance | Implemented; release gates pending |
| 2 | Crowded-table readability and selection/latest-play distinction | Review after Phase 1 gates |
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
