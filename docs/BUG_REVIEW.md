# Fresh bug review — 2026-10-26

Reviewed baseline `a7fbbe5`, including the original local specification, engine,
planner boundary, persistence, game/tutorial controls, backup import, and service
worker update handling. Multiplayer remains deferred.

| Severity | Confirmed defect and reproduction | Correction |
| --- | --- | --- |
| High | Place a hint, wait for Saved, reload: Continue disappears because a second Undo snapshot contains the same rack tiles on the table and in the rack. Undo could also restore this damaged snapshot. | Capture one snapshot before changing either table or rack. Validate writes. Recover older positions when clearing damaged Undo history alone makes the complete position valid; report the recovery. |
| High | Create three groups, return the first to the rack, then split the third into a new group: the generated ID can duplicate the surviving source ID, making destinations ambiguous and the save invalid. | Generate an unused deterministic ID and reject plans with duplicate group IDs. |
| Medium | Split red 1,2,joker,4,5,6 into red 1,2,joker and red 4,5,6 plus rack red 7: the joker still represents red 3, but the old validator demands a replacement. | Permit a split retaining the joker's value, colour and an original natural tile. Moving/reassigning the joker still requires its exact rack replacement. |
| Medium | Submit a timestamped action after the deadline but before the next polling tick: a late play can be accepted. | Check the deadline in the reducer for every timestamped gameplay action; expire by restoring edits and drawing once. Avoid opening a penalty confirmation for an already expired turn. |
| Medium | On a 375×667 phone, enable match scores, timer, coaching and large tiles: Draw extends below the viewport. | Bound optional game context in a scrolling region; reserve room for the table, rack and turn controls. Scroll a newly received hint into view within that region. |
| Medium | In practice, add the red run to the existing 10s group, or send the joker-replacement red 5 to New: the lesson changes objectives or enters an invalid state it cannot guide out of. | Check the highlighted destination before applying the move. Still allow completing a partial group in its existing destination. Detect joker replacement in the original run. |
| Medium | Persist an invalid in-memory position after a valid save: the old write path overwrites the good position and reports success. | Validate before writing, preserve the previous save on failure, and distinguish a validation failure from unavailable browser storage. |

Additional hardening: malformed nested save values return false instead of throwing;
turn/pass counters and snapshot group identifiers are validated. The illustrated
rules now name the actual touch control for returning selected tiles to the rack.

Regression coverage includes seeded mixed editing, exact hint Undo/reload, damaged
history recovery, deterministic ID collisions, late actions, joker splits,
malformed saves, partial tutorial moves and incorrect destinations, plus phone,
tablet and desktop bounds with combined options. Existing bot simulations, match,
backup, cross-tab and offline/update checks remain part of the full suite.

This review does not certify the absence of bugs. Automated viewport and touch
checks use Chromium; physical iPhone/iPad Safari, assistive technology and the
five-person beginner study still require people. No user-study results are claimed.
