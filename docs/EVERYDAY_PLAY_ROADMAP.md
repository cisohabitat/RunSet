# Everyday-play improvement cycle

Approved 2026-10-28. Publish each phase separately to main and require its complete
exact-commit CI, including aggregate check, before beginning the next phase.
Physical Apple-device, older-player and native Mandarin listening checks remain
paused. Multiplayer remains deferred. No game rules or saved-game schema changes.

| Phase | Scope | Status |
|---|---|---|
| 1 | Group existing More tools by player task without another submenu | Published; complete main CI passed |
| 2 | Extend existing latest-play review with factual bot/validity context | Implemented; main CI pending |
| 3 | Check crowded long sessions and repeated rounds; record performance limits | Pending |
| 4 | Stress interrupted persistence and unusual legal actions; fix evidenced failures | Pending |
| 5 | Audit bilingual instructions and control names; connected release verification | Pending |

## Phase 1

The existing More menu mixed teaching, rack tools, scores and history. Three
labelled sections now collect Help with this turn, Find and arrange tiles, and
Game details. Each tool keeps its existing control name, native focus behavior,
read-only semantics and one-click entry; there is no new disclosure level.
Break/save controls remain first. Nothing is added to the permanent board.
Shared offline/compatibility move-help journeys verify tool grouping as well as
real placement, focus, exact saves, selected tiles and timed expiry.

Phase 1 accepted main: 6fc01a0, complete CI [40636584845](https://github.com/cisohabitat/RunSet/actions/runs/40636584845).
Local: 170 unit tests, 4 Chromium and 12 production compatibility checks; reviewed
English light and Chinese dark phone screenshots. Initial gzip 99,084 bytes.

## Phase 2

Existing latest-play review now offers a single summary of completed destinations
with counts of newly placed physical tiles, plus plain group/run pattern rules.
It retains tile-by-tile review and explains that intermediate rearrangements
are not recorded; whole-turn opening/joker checks remain engine-owned. No hidden
racks or inferred bot decisions are used. Modal opener focus is explicit with
a guarded one-frame WebKit retry. Existing bilingual review journeys now verify
first-use offline review, deduplication, pattern explanation, exact draft/save
and selection preservation, reload and real timer expiry closing the old view.

Phase 2 local evidence: 171 unit tests, 2 Chromium and 6 production compatibility
review journeys passed. Both phone theme/language screenshots inspected. Initial
gzip 99,099 bytes; 65 precached files including optional review styling.
