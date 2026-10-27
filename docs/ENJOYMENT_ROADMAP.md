# Confidence and enjoyment cycle

Publish each phase to main and require its exact-commit CI to pass before the
next begins. English and Simplified Chinese, compact/comfortable layouts and
regular-save isolation apply throughout. No multiplayer. Physical Apple sessions,
older-player studies and native Mandarin listening remain paused.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Clearer turn guidance | Published, CI passed | Named turn owner, correct multi-opponent wait guidance, on-demand next action and last completed turn. |
| 2. More helpful hints | Published, CI passed | Non-mutating board preview, destination and rule explanations, explicit placement. |
| 3. Friendlier difficulty | Implemented, CI pending | Capability comparison and clear learning guidance, preserving audited strategies. |
| 4. Better game endings | Queued | Visual scoring and one evidence-based learning takeaway, clear replay choices. |
| 5. Daily gentle practice | Queued | Optional date-based puzzle and graduated clues without streak pressure. |
| 6. Final polish and release audit | Queued | Complete journeys, responsive visuals, audio/loading/recovery and final fixes. |

Phase 1 reuses the existing More menu so the meld area loses no screen space.
What can I do now? remains available after coaching is dismissed. Last completed
turn reads the public engine log, not private racks or a guessed strategy. Existing
optional detailed narration and latest-tile marks remain available. Bot guidance
counts seats before the human rather than promising the next turn prematurely.

Previous quality cycle completed at 3da2e6f with CI 40432843482 passing.

Phase 1 correction 0add1fa passed CI 40449251355 and all four production turn
checks before Phase 2 began. Phase 2 adds a read-only, reducer-validated proposed
table with labelled destinations, rack outlines and explanations. Escape/back
preserve the save and restore focus; placement and turn completion remain explicit.

Phase 2 local verification: 114 unit tests, five preview flows (including timer
expiry), eight existing long-hint geometry cases, bilingual phone/tablet Axe
checks and inspected phone screenshots. The configured browser total is 208;
a first-use offline preview brings production-offline coverage to 18 flows.
The preview scroll region is keyboard-focusable; native modal focus returns to
the opener. These automated checks do not replace physical Safari testing.

Phase 2 b7552a9 passed CI 40450397253, all 18 offline flows and all five
production preview checks before Phase 3 began. Phase 3 adds an explicit
post-opening capability matrix, live selected-style learning advice and honest
Normal/Hard overlap guidance. Audited bot strategy/budgets and gentle defaults
remain unchanged; no new strength ranking is inferred.

Phase 3 local verification passed 114 unit tests and eight setup/returning-player
flows across phone, iPad and desktop. Two new bilingual comparison flows include
Axe checks, saved-game isolation and explicit gentle-default replacement (210
configured browser flows). Phone screenshots were inspected in both themes.
