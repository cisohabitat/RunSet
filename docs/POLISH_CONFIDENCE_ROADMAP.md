# Everyday polish and confidence

Approved 2026-10-28. Publish each phase separately to GitHub main using the
existing Git integration. Require the complete exact-commit CI workflow,
including every browser job and aggregate check, before beginning the next phase.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Visual consistency on phone, landscape iPad and desktop | Complete: 5d1120f, CI 40716966856 passed |
| 2 | Clearer draft, ready-to-end and completed-turn feedback | Published implementation; exact-commit CI gate applies |
| 3 | Expandable local round details and difficulty filtering | Pending |
| 4 | Clearer update checks and interrupted-save/offline recovery verification | Pending |

Multiplayer remains deferred. Older-player/physical-device study stays paused;
automated viewport checks do not establish physical Apple or native voice quality.

## Phase 1

Fresh review covers Home, setup, rules, learning, exercises, regular game,
Settings and existing results journeys in both languages/themes. The new journey
first visits optional screens while offline and retains exact regular-save bytes.

Measured the Settings Opponent pace selector at 26 px high in standard reading,
compared with 48 px Display theme. Both now share theme-token borders/radius,
48 px minimum height and wrapping labels that allow the selected option room on
phones. Removed the redundant inline theme style. No game/view preference changes.

On landscape coarse-pointer tablets, active opponent waiting dots now sit beside
the title rather than consuming the metadata column. The difficulty/tile count
keeps its width, with existing title ellipsis, card minimum, text and tile sizes.
No new row is introduced; strict expanded board floors remain required.

The initial test exposed a lazy-dialog measurement race: it could enumerate zero
selects before Settings loaded. Regression now awaits the visible dialog and
exact control count. Text line checks count distinct rendered y positions rather
than mistaking separate React text nodes for wrapped lines.

Build: 99,667 gzip bytes, unchanged 100,000-byte initial budget; 76 precached files.

Local verification: all 202 units and 31 browsers passed (17 main, 12 compatibility,
2 offline). Reviewed phone Settings/Home/results and iPad setup/populated board
screenshots. Existing strict comfortable-phone board floor passed in all three
compatibility projects. Publish and fully CI-gate this phase before Phase 2.

Phase 1 first publication 641d448 / CI 40714340749 stopped at a WebKit-phone
round-history regression (109 passed, one failed). Trace showed SimpleHome's
lazy resume summary arriving above More options after the test's initial scroll,
invalidating its immediate hit test. The helper now awaits the actual SimpleHome
and, for an unfinished game, visible resume context before measuring/tapping.
Retain every geometry assertion. Publish this correction and require a fresh full
workflow before Phase 2; do not treat the original gate as successful.

All six focused WebKit-phone repetitions passed after the readiness correction
(three in each language). App source/build is unchanged from the reviewed phase.

The corrected Phase 1 commit 5d1120f4541bb51566980df879b077dd55796624 passed the
complete CI workflow 40716966856 before Phase 2 began. Matching production READY
and all 12 bilingual visual/history live journeys passed. Original failed gate
40714340749 remains recorded above rather than represented as successful.

## Phase 2

The existing regular-game status row now labels Choose tiles or draw/pass,
Unfinished turn, Play a rack tile (rearrangement without a rack addition),
Ready to end turn and Opponent turn. Labels derive only from the current cached
engine check and actual draft comparison, with no new game state or persistence.
Opening points, played counts, actual actor and full engine repair reason remain
visible; public-only invalid edits also show their reason. Labels stay inside the
same bounded focusable status region, never a permanent additional board row.

Ready describes a legal draft, never a committed turn. Explicit End turn still
runs the same authoritative engine/penalty confirmation. The existing accepted
turn notice and actual next actor provide completed-turn feedback. No extra
sounds, automatic commits or timer pauses. Practice retains its lesson labels.

All 202 units and the two Chromium connected turn-state journeys passed. The new
journey includes actual incomplete placement, penalty cancellation, free Reset,
legal placement, Undo, unchanged absolute deadline, no premature turn advance,
accepted handoff and real expiry restoring drafts/drawing exactly one tile.

Expanded connected journeys also passed a real legal split of a six-tile public
run into two runs with no rack tile played: status asks for a rack tile, and the
engine refuses End turn without advancing. Screenshot review found the decorative
status dot could wrap onto a line of its own before a long reason; the copy now
flexes within remaining width, retaining complete text and the existing row.

Final Phase 2 local verification: 202 units and 22 browsers passed (2 main,
18 compatibility including the strict phone/tablet meld-space and actual handoff
regressions, 2 offline). Reviewed Chinese draft/ready phone, English phone and
Chinese iPad screenshots. Final build: 99,667 gzip bytes; 76 precached files.
