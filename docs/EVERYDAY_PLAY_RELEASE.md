# Everyday-play release evidence

Approved scope: simplify existing tools, explain completed plays, check long
sessions, strengthen recovery and polish English/Simplified Chinese. Each phase
is published separately to main; the next begins only after complete exact-commit
CI succeeds, including the aggregate check. Deployment remains Git-driven.

## Earlier accepted gates

| Phase | Accepted main | Complete CI |
|---|---|---|
| 1. Task-based More sections | 6fc01a0 | [40636584845](https://github.com/cisohabitat/RunSet/actions/runs/40636584845) |
| 2. Completed-play explanations | 025fb98 | [40637946731](https://github.com/cisohabitat/RunSet/actions/runs/40637946731) |
| 3. Long-session verification and caching | c1420ee | [40640839844](https://github.com/cisohabitat/RunSet/actions/runs/40640839844) |
| 4. Interrupted-read recovery | 74e10fd | [40642737840](https://github.com/cisohabitat/RunSet/actions/runs/40642737840) |

Phase 3 first publication bb3bce0 exposed a pre-existing contrast-test race:
Home became hidden after an expanded-view reload. The correction explicitly
chooses View → Standard before Home; 26 local contrast journeys and the complete
corrected CI passed. No forced clicks, retries, larger timeouts, skipped tests or
weakened assertions were introduced. Six live crowded-session journeys passed
against c1420ee's matching READY production deployment.

## Player-visible changes

- More groups existing tools by task without another disclosure level or a new
  permanent board row. All existing actions remain available.
- Latest-play review summarizes completed destinations and explains matching
  numbers/different colours or consecutive numbers/one colour. It preserves
  tile-by-tile navigation, literal names, joker representation and read-only
  semantics. It describes neither unrecorded rearrangements nor bot intentions.
- Selection/clock renders reuse expensive pure validation and completed-table
  projections until the immutable game changes. The reducer still checks moves.
- A failed save read keeps both stored copies, invalidates queued work and blocks
  unseen writes. It cannot resurrect a remotely deleted game. Unreadable cross-tab
  notifications keep the live board/selection instead of pretending a deletion.
- Recovery notices use 16 px text, 18 px in comfortable reading, 44/48 px close
  targets, top alignment and keyboard scrolling. Review text keeps its own reading
  alignment when opened from results. The Chinese turn-help title distinguishes
  a turn from a round.

## Local evidence and final publication gate

The final local unit run passed 179 tests. Its stronger translation audit checks
conditional alternatives and no-substitution templates plus every meaningful
placeholder; English plural suffix {s} has no Chinese equivalent. The final build
is 99,256 gzip bytes against the unchanged 100,000-byte initial budget and includes
65 precached files. Final affected-browser acceptance is recorded in the roadmap;
English light and Chinese dark phone/tablet screenshots are reviewed.

The existing connected release journey now checks grouped tool discovery and
completed-destination explanations after an actual accepted win, then downloads
a real backup, deletes both saved copies, restores the downloaded bytes and
reloads. It retains exact saves, deadlines, history, 106 unique physical IDs,
preferences, native focus, real hit targets, Axe and runtime-error checks.
First-use tools and Chinese remain available offline. Interrupted-read journeys
verify initial and cross-tab read failures, recovery and a real Undo.

The complete exact-main-commit workflow is inspected after this release commit
is published, before the release is handed back. See the [main CI history](https://github.com/cisohabitat/RunSet/actions/workflows/ci.yml?query=branch%3Amain)
and the final handoff for its exact run permalink. READY deployment status alone
is not CI acceptance. Public-site acceptance runs only against a matching READY
production commit; a queued deployment is not described as live verification.

## Long-session evidence and limits

[Raw performance samples](EVERYDAY_PLAY_PERFORMANCE.json) include source
fingerprints, 50 table/50 rack tiles, 100 initial Undo snapshots and four-times
Chromium CPU slowdown. All final sample maxima are below 396 ms against the
unchanged 1,000 ms smoke threshold. These small samples do not establish a
percentage improvement: part of the baseline overlapped an engine soak.

The additional engine soak verifies 5,000 conserved turns and 200 backup round
trips across timed/untimed games with one/three opponents and continued matches.
Two local runs observed 59/60 rounds; bounded planner timing can change choices.
A further 8,000 seeded editing actions cover deadline boundaries, input state
immutability, save validity and bounded history. Eight browser journeys exercise
16 populated-table edit/Undo-or-Reset cycles apiece and exact offline reloads.

Physical Apple-device checks, older-player comprehension studies, native Mandarin
listening and battery measurements remain unverified/paused. Linux WebKit is
browser compatibility evidence, not physical iOS acceptance. No automatic speech,
new recordings, multiplayer, hidden-rack access or game-rule changes are added.
