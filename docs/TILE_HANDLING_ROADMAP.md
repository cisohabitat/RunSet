# Easier tile handling and clearer decisions

Publish each phase to main and wait for its complete exact-commit CI before the
next implementation. Keep English and Simplified Chinese, default rules, saves,
offline support, tile sizes and strict geometry. Multiplayer stays deferred;
physical-device and older-player work remains paused.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Rack organisation | Published; exact-commit CI gate | Optional manual display order with touch controls; durable order and automatic colour/number modes. |
| 2. Crowded-board navigation | Queued | Find selected tiles and the latest accepted placement without changing play. |
| 3. Helpful explanations | Queued | Affected tiles and one clear next action for rejected moves, in both languages. |
| 4. Complete-turn practice | Queued | A whole-turn learning path with prompts that can be reduced. |
| 5. Release hardening | Queued | Combined responsive, keyboard, cross-browser and offline journeys. |

Phase 1 stores a validated, bounded per-round rack display preference separately
from game saves. Manual order preserves physical IDs through temporary removal,
Undo/Reset and reload; newly drawn IDs append. Automatic colour/number modes sort
newly arriving tiles too. Practice does not inherit the preference. Arrangement
uses a separate modal with explicit Keep order/Cancel; stale physical racks or
turn changes discard its draft. Sorting and arrangement remain available in More.

CI now runs the complete Chromium, compatibility and offline suites in parallel
jobs after type/unit/build/benchmark checks. Every job retains a twenty-minute
limit, offline retains five minutes, all browser dependencies/audio setup and
failure artifacts remain. Phase progression checks the entire workflow result,
never one matrix job or Vercel's deployment status.

The crowded-rack journey exposed a WebKit touch-focus scroll between pointer-up
and synthesized click. New meld activation now binds a completed touch to its
button, rejects cancelled/scrolling gestures and suppresses a duplicate native
click. Mouse/keyboard keep their ordinary click path. A real Chromium touch
sequence checks cancellation, panning, exactly one history entry and keyboard/
mouse activation; all six existing tutorial journeys still pass.

Local Phase 1 checks passed 131 units, all 42 existing rack/board geometry cases,
the seven touch/tutorial cases and all six bilingual production-browser rack
journeys with 50 tiles. Save bytes, selection, cancellation, reload, Undo,
automatic sorting, readable modal controls and offline first use are covered.
The initial download remains below the unchanged 100,000-byte gzip limit. Final
exact-commit CI is the phase gate.

The final build passes at 99,996 initial gzipped bytes. Readable Cancel text is
scoped to the arrangement modal; all main tile sizes and targets stay intact.
The full gate now includes 131 units, 277 Chromium cases, 177 compatibility
cases, 19 offline cases and benchmark smoke. The existing check job aggregates
every matrix result, including failures or skipped dependencies.
