# Easier tile handling and clearer decisions

Publish each phase to main and wait for its complete exact-commit CI before the
next implementation. Keep English and Simplified Chinese, default rules, saves,
offline support, tile sizes and strict geometry. Multiplayer stays deferred;
physical-device and older-player work remains paused.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Rack organisation | Published; CI passed | Optional manual display order with touch controls; durable order and automatic colour/number modes. |
| 2. Crowded-board navigation | Published; exact-commit CI gate | Find selected tiles and the latest accepted placement without changing play. |
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

The first split CI run (40506462470) passed units/build but found the benchmark
report directory had implicitly come from browser tests. Quality now creates
that output directory explicitly. The benchmark itself completed; no test or
benchmark gate was removed. The aggregate correctly failed when quality failed.

Follow-up CI 40506796676 passed quality/offline but exposed a duplicate
placement-announcement selector and a legacy test dereferencing a save before
its async write. Rack-order status now has its own semantic selector; the
experience journey awaits persistence. All nine targeted experience/touch cases
pass without weakening placement or tile-conservation checks.

Phase 1 final 8de6b4a passed complete CI 40508473691 before Phase 2 began.
Its matching ready live release passed all six feedback checks; the preceding
same-feature release passed all six offline crowded-rack journeys.

Phase 2 adds finders inside More with no permanent toolbar row. Selected tiles
and actual accepted edits are located one at a time, with focus and a readable
outline. A hidden rack is revealed only when its target needs it. Rejected
requests and Undo are not new placements; accepted hint plans are observed from
real snapshots. Save bytes, current selections and timed deadlines stay intact.

The phone journey exposed WebKit retargeting pointer-up after native focus scroll.
A per-gesture window listener completes only unmoved touches on their original
button and cleans up on finish/cancel/drag/unmount; desktop dragging and keyboard
keep their native path. Shared static tile faces let decorative Home artwork
avoid loading interactive handlers, reducing the initial English download.

Phase 2 unit coverage verifies accepted moves, applied hints, Undo/new-turn
rejection and the capped one-hundred-snapshot history. All 134 units pass. All
18 production WebKit/Firefox finder, rack-order and placement-feedback journeys
pass, including Chinese comfortable phones and first-use offline assets.
Home artwork now shares non-interactive tile faces; interactive handlers remain
in optional gameplay chunks. The initial bundle remains below 100,000 gzipped
bytes. Separate desktop dragging and cancelled-touch regressions protect both
input paths. Physical-device acceptance remains paused.

The combined audit caught native trailing clicks after a handled touch and a
layout shift when beginning a drag on an unselected tile. A bounded compatibility
click guard now ends on the next pointer-down, page hide or one-second cleanup;
keyboard/programmatic clicks stay usable. Desktop selection stays unchanged until
the drop chooses its physical IDs, avoiding a new row halfway through the drag.
All 32 affected Chromium touch/drag/density/teaching checks and all 18 production
finder/rack/feedback cases pass. Ten accessibility cases also passed in both
languages/themes with the shared home tile faces. Screenshots were inspected.

Final Phase 2 local verification passed 134 units, ten accessibility cases,
32 affected Chromium flows, all 18 production finder/rack/feedback journeys and
all 19 production offline cases. Screenshot inspection covers both themes and
languages, including unchanged decorative tile faces. The build passes at
99,506 initial gzipped bytes under 100,000. The complete gate now has
278 Chromium cases, 183 compatibility cases and 19 offline cases, plus units and
benchmark. Exact-commit CI must pass before Phase 3 implementation.
