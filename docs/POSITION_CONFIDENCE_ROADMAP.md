# Position confidence roadmap

Approved 2026-10-28. Complete and publish phases 1–3 separately, requiring each
exact-main-commit workflow (quality, every browser suite, aggregate check) to
pass before starting the next. Phase 4 remains paused. Multiplayer is deferred.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Temporary practice copy of the current human turn | Implemented; verification and main CI pending |
| 2 | Optional display organisation for public melds | Pending |
| 3 | Clear return-to-game context and next action | Pending |
| 4 | Older Chinese-speaking player study on physical Apple devices | Paused |

## Phase 1: practise this position

Help with this turn offers a temporary, lazy-loaded modal. It copies the human
rack, public table and original opening/joker context, including unfinished edits.
It never copies hidden allocations, clocks, match scores, logs or Undo history.
Unseen physical IDs are kept in an unrendered inert holder solely to preserve
engine conservation. No opponent/pool counts or draws are presented as real.

Moves, sorting, Undo and Reset use the pure reducer on separate local state.
Check validates the whole turn and accepts it through the reducer without copying
anything back. Invalid checks apply no penalty. Reset uses the original turn
snapshot; Restart uses the captured draft. Closing/reloading discards practice.
No practice storage key, profile mutation, automatic hints, bot or speech is added.

The regular game stays mounted with its selection/view intact. Its actual timer
continues; any real state replacement closes the old copy. Modal focus returns
to the explicit opener; an expired/unmounted opener is never refocused. The
practice board has distinct table/rack IDs and no second main-content landmark.

Phase 1 local evidence: 182 unit tests; ten final practice journeys (2 Chromium,
6 compatibility, 2 offline) and six unchanged comfortable table-space checks
passed. Reviewed English light/Chinese dark phone and tablet views. Standard
phone practice fits two meld columns without smaller tiles; comfortable captions
and controls stay readable. The completed-table scroll region is keyboard
focusable. Initial gzip 99,252 bytes under the unchanged 100,000-byte budget;
67 precached files. Complete main CI is checked after publication.
