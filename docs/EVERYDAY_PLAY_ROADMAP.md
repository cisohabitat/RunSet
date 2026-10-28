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
| 4 | Stress interrupted persistence and unusual legal actions; fix evidenced failures | Published; complete main CI passed |
| 5 | Audit bilingual instructions and control names; connected release verification | Published; exact-main release gate checked after publication |

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

Phase 4 accepted main: 74e10fd, complete CI
[40642737840](https://github.com/cisohabitat/RunSet/actions/runs/40642737840).

## Phase 5

The static-copy audit now checks conditional branches and no-substitution template
literals passed to t, including accessible names. All audited branches translate.
Dictionary checks require every name/count/value placeholder to survive translation;
English plural suffix {s} is deliberately exempt because Chinese has no matching
plural suffix. Names remain literal. Chinese turn-help heading now says 本回合
怎么出牌, distinguishing a turn from a whole round.

Global recovery notices increase from 12 px to 16 px (18 px comfortable), with
44/48 px dismiss targets. Notices align at the top, wrap and remain keyboard
scrollable; short playing notices leave enough room for the larger close target.
Expanded-board limits, tile sizes, game state and deadlines are preserved.
The existing connected release journey additionally checks task-group discovery
and the all-destinations explanation after an actual accepted win, before real
download/delete/import/reload. Notice journeys check font sizes, native focus,
actual hit targets and exact saves. No speech recording or human study is claimed.

Final Phase 5 local acceptance: 179 unit tests, then the strengthened translation
audit after copy polish; 26 final affected-browser cases passed (4 Chromium,
18 compatibility, 4 offline). Final phone/tablet screenshots were inspected in
both languages/themes. Result-opened review keeps start alignment; the Chinese
recovery notice is concise. Initial gzip 99,256 bytes, 65 precached files.
Full exact-main CI and matching-production acceptance are checked after this
publication; the handoff links the exact final run. Final evidence:
[EVERYDAY_PLAY_RELEASE.md](EVERYDAY_PLAY_RELEASE.md).
