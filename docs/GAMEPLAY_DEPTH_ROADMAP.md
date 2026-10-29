# Gameplay depth and release confidence

Start with endgame decisions, then complete-match coverage, crowded-board review
and release consolidation. Publish phases separately to main; require complete
exact-commit CI (quality, all six browser jobs and aggregate check) before the
next phase. Multiplayer remains deferred. Physical Apple, older-player and
native Mandarin studies remain paused.

Baseline: 2ef9269, complete CI 40820134705 passed (207 units / 771 browser cases),
with a matching READY production release and 13 passing live checks. The prior
everyday-quality cycle is complete.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Diagnose blocked endings and fix demonstrated missed legal endgame moves | Complete: 3e40722, CI 40869715541 passed |
| 2 | Verify four-player games and complete multi-round matches, scores and recovery | Implemented; full exact-commit CI required after publication |
| 3 | Review crowded-board destinations, played-tile tracking and rack navigation on phone/iPad | Planned |
| 4 | Consolidate findings into a stable release and remove remaining inconsistencies | Planned |

Phase 1 must distinguish a legal exhausted-pool ending from a proven missed move.
The prior 115 blocked endings out of 120 rounds do not establish a defect by
themselves. Use explicit legal witnesses, preserve all 106 IDs and validate the
original planner proposals before fallback. Keep Easy/default and Normal style,
the opening threshold, exact joker replacement/reuse and the shared 240 ms work
cap inside the 380 ms request budget. Do not tune to sampled wins.

Two independently witnessed crowded-table finishes failed before the change,
including reversed meld order. Small-table, joker and unopened controls passed.
Hard now probes one relevant meld at a time, preserving its already-played rack
tiles and the rest of the table. Each local proposal passes the complete turn
validator, and timeout keeps the best validated plan. The probe shares the
original budget; it does not make the bounded planner globally optimal.

Discovery deals 61001–61004 supplied additional known legal plays. Frozen final
pass positions can be compared directly without claiming new round trajectories
or win rates. Verify the final implementation on separate deals 62001–62004,
all six mixed assignments and both orders of each pair. Record raw fingerprints,
latencies, witness scope and remaining limitations. The actual browser worker
must also finish the crowded fixture in both languages and on first offline use.

The complete final audit covered 48 baseline rounds and 115 recorded final-pass
positions. Hard found a play in all 24 positions with a bounded constructive
witness, playing at least its tile count each time. This sample supplied no known
rack-empty witnesses; six separate positive tactical controls cover finishes.
All proposal legality, physical IDs, input immutability and source checks passed;
zero measured calls exceeded 400 ms. See [full review](ENDGAME_REVIEW.md).

Local release checks passed: all 218 units, production-budget benchmark smoke,
five focused Chromium cases and 12 offline compatibility cases. Build/typecheck:
98,713 initial gzip bytes, 77 cache files, original budget preserved. Require
complete exact-commit CI after publication before starting Phase 2.

Phase 4 should also revisit the 375 px Results header's brand clearance beside
language/menu/settings, observed in the endgame capture; retain native targets.

Initial a302308 / CI 40867855167 failed the combined extension/borrow unit on a
cold runner; 217 other units passed, browser jobs skipped. The correction tests
simple one-tile transfers before generic enumeration, sharing the original 35 ms
local budget. All 218 units and the fresh 24-position/eight-tactical cold check
pass without relaxed assertions or limits. The original 48-round report remains
versioned to a302308; [cold-check evidence](ENDGAME_COLD_CHECK.json) fingerprints
the corrected strategy. Complete fresh CI remains required before Phase 2.
The final production-budget smoke, build/typecheck and all 17 focused browser
cases passed again after the cold-run correction; initial gzip remains 98,713.

Phase 1 finished with 218 units and all 779 browser cases passing, matching
production READY and eight passing live endgame checks. Phase 2's
[match review](MATCH_REVIEW.md) records six complete ordinary-deal matches,
independent scoring, timed expiry and backup recovery, plus a demonstrated
malformed-score import fix. Publish and require all eight CI jobs before Phase 3.
