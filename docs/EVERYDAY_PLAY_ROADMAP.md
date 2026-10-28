# Everyday-play improvement cycle

Approved 2026-10-28. Publish each phase separately to main and require its complete
exact-commit CI, including aggregate check, before beginning the next phase.
Physical Apple-device, older-player and native Mandarin listening checks remain
paused. Multiplayer remains deferred. No game rules or saved-game schema changes.

| Phase | Scope | Status |
|---|---|---|
| 1 | Group existing More tools by player task without another submenu | Published; complete main CI passed |
| 2 | Extend existing latest-play review with factual bot/validity context | Published; complete main CI passed |
| 3 | Check crowded long sessions and repeated rounds; record performance limits | Published; corrected complete main CI passed |
| 4 | Stress interrupted persistence and unusual legal actions; fix evidenced failures | Implemented; verification and main CI pending |
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

Phase 2 accepted main: 025fb98, complete CI [40637946731](https://github.com/cisohabitat/RunSet/actions/runs/40637946731).

## Phase 3

Game memoizes full-turn validation and table/draft comparisons by immutable game
state, avoiding repeat work for selection and clock-only renders. Latest-play
review similarly caches its public completed-tile projections. Authoritative
reducer validation is unchanged. New browser soak uses 50 table/50 rack tiles,
100 initial Undo snapshots, 16 placement/Undo-or-Reset cycles, original deadlines,
106 unique IDs, exact saved bytes after reload, expanded view, Axe and errors.
Compatibility versions begin the flow online and perform gameplay/reload offline.
An additional engine soak exercises 5,000 turns and 200 actual backup round trips
with one/three opponents, timed/untimed and continued matches.

Phase 3 local gate: 172 unit tests, 8 repeated-edit browser journeys and 4 final
4x-CPU timing checks passed. Raw samples and source fingerprints are in
[EVERYDAY_PLAY_PERFORMANCE.json](EVERYDAY_PLAY_PERFORMANCE.json). All timing
maxima remain below the existing 1,000 ms smoke limit. The baseline overlapped
part of a soak run; no causal percentage-speedup claim is made. The 5,000-turn
soak observed 59/60 rounds in two runs (bounded planner timing changes choices).
Battery and physical-device results remain unmeasured. Initial gzip 99,100 bytes.

The first Phase 3 main workflow (40639642030) passed quality, Chromium, both
WebKit suites and offline; Firefox passed 82/83. The old contrast test raced the
expanded-view header's hide effect after reload, then attempted Home while the
header was hidden. It now chooses Standard through the actual visible View
selector before using Home. The 26 local Chromium/Firefox contrast journeys pass
with unchanged contrast, geometry, save and deletion assertions. A new complete
exact-commit main gate is required before Phase 4. No timeout or retry was added.

Phase 3 accepted correction: c1420ee, complete main CI
[40640839844](https://github.com/cisohabitat/RunSet/actions/runs/40640839844).
All six matching live crowded-session journeys passed on the READY deployment.

## Phase 4

Found and fixed a save-loss risk: loadGame treated a failed storage read like
malformed JSON and attempted removal of the primary save. Failed reads now keep
primary/recovery bytes intact, invalidate queued writes and refuse replacement
of an unseen existing save until a successful read establishes its guard.
Malformed-data cleanup remains unchanged. A bilingual notice offers reload and
explains that stored data was kept.

Fault tests cover interrupted queued locks, stale unseen replacements, cancellation
while waiting, and rollback/retry at the game, reading and language write steps.
New browser journeys inject a temporary read exception, verify both stored copies,
then recover the exact timed draft offline and make a real Undo. Additional seeded
editing coverage exercises deadline boundaries, physical IDs and save validity.
Existing update/activation recovery tests remain in the full offline suite.

The same audit found App treated an unreadable cross-tab result as a deleted
save. loadGame now exposes an explicit unreadable result; conflict/event handlers
keep the live game and selection, show Not saved and the recovery notice, and
wait for a successful read. Shared browser journeys test failed and recovered
storage notifications without changing the actual saved bytes.

Unreadable storage also blocks new writes explicitly, including when another tab
has deleted the key. A dedicated regression proves an old in-memory game cannot
resurrect that deletion before a successful read clears the blocked state.

Phase 4 local gate: 179 unit tests and 10 affected browser journeys passed
(2 Chromium, 6 compatibility, 2 offline). Both-language notice screenshots were
inspected. The final 8,000-action test checks original state immutability, valid
saves, 106 unique IDs, bounded history and actual deadline replacement. Initial
gzip 99,186 bytes; 65 precached files. Full exact-main CI is required next.
