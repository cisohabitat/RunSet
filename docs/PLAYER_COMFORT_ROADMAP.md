# Confident and comfortable play

Publish each phase separately to main. Require the complete exact-commit CI
workflow before starting the next phase. Keep browser-only/offline play,
English/Simplified Chinese, strict tile/board geometry and existing game rules.
Physical-device, older-player and native Mandarin acceptance remain paused;
multiplayer remains deferred.

| Phase | Status | Scope |
| --- | --- | --- |
| 1. Smarter in-game help | Published; full CI and live checks passed | Locate affected tiles, identify the meld and distinguish a local repair from a complete turn. |
| 2. Bot difficulty and fairness | Published; full CI and live checks passed | Reassess production behavior on fresh deals and make capabilities and public move explanations clear. |
| 3. Crowded-board readability | Published; exact-commit CI required before Phase 4 | Improve long-game meld navigation without shrinking touch targets or the table. |
| 4. Gentler play | Pending | Clearer turn changes and restrained feedback, with reduced motion and bilingual recovery copy. |
| 5. Release hardening | Pending | Connected complete-game, interrupted-session, update and offline recovery checks. |

## Phase 1

Move help names the affected group/run and distinguishes an individually repaired
meld from a fully valid turn. Find affected tiles closes help, reveals the actual
tile and focuses its existing outline without selecting, placing or changing the
save/deadline. Candidate search tries reducer-accepted additions rather than
stopping at a locally plausible but blocked tile. End turn remains explicit.

Local checks: 165 units, typecheck/build (99,904 initial gzip bytes under the
unchanged 100,000 budget), six production WebKit/Firefox journeys and two offline
Chromium journeys passed. Screenshots inspected in English/light tablet and
Chinese/dark comfortable phone. Tests retain 64×88 preview tiles, visible footer,
Axe, timer expiry and exact save/selection preservation after finding a tile.

Both existing bilingual keyboard/handling release journeys also passed.

Phase 1 commit 5261f88 passed complete CI
[40600611275](https://github.com/cisohabitat/RunSet/actions/runs/40600611275)
before Phase 2 implementation. Its matching READY live release passed all six
bilingual WebKit/Firefox move-help journeys.

## Phase 2

Fresh production audits completed 60 rounds / 6,525 turns, with no rejected
plans or measured calls above 400 ms. All physical tiles, planning inputs and
completed tables passed validation. See [findings and raw reports](PLAYER_COMFORT_BOTS.md).
No tuning was warranted; the beginner defaults remain. Opponent styles and fair
play is optional in More, reads actual levels and preserves literal names.
Worker-boundary coverage verifies bot/hint redaction without mutating the game.

Local Phase 2 checks passed 167 units, typecheck/build (99,895 initial gzip
bytes), six new production WebKit/Firefox journeys, two offline journeys, two
Chromium guide journeys and two existing setup-comparison regressions. Every
paragraph is checked fully inside the bounded scrolling menu, not merely present
in the DOM. Names matching dictionary entries stay literal; selection and saved
deadlines remain exact. English/light and Chinese/dark screenshots were inspected.
The full release gate retains 286 Chromium, 225 compatibility and 33 offline
cases, plus units and benchmark smoke.

Phase 2 commit 05dac50 passed complete CI
[40603733840](https://github.com/cisohabitat/RunSet/actions/runs/40603733840)
before Phase 3 implementation. Its matching READY Vercel release passed all six
bilingual production guide journeys.

## Phase 3

More → Table overview lists numbered melds with counts, valid kind/colour/number
range/points or Needs fixing. Values come from inspectMeld, including represented
joker values. Choosing an entry closes the modal and finds its first actual tile;
it does not select or place anything. The existing finder closes More, preserves
a hidden rack for table targets and uses the tile focus outline. Done/Escape
restore the opener; actual turn changes close stale overviews. The optional CSS
and modal reserve no additional permanent table area or smaller touch tiles.

The overview uses two-line entries and two columns on wider screens. Final
review corrected standalone Chinese meld/points labels and made empty imported
draft entries non-navigable. Summaries never infer numbers for an invalid meld.
Local verification passed the 169-unit full suite plus the added empty-draft/
translation regressions, typecheck/build (99,898 initial gzip bytes under the
unchanged 100,000-byte budget), and the crowded-board journeys. Coverage starts
with 50 table and 50 rack tiles, splits the table into 15 valid melds, creates an
unfinished 16th, retains 100 Undo snapshots, hides the rack and finds the final
actual tile without changing selection/save/deadline. It also expires an open
overview through the real timed reducer. Footer/list targets remain >=48 px;
expanded table floors remain >=300 phone / >=450 tablet. Existing board-space
regressions retain regular, expanded, short landscape and practice geometry.
Full CI now retains 170 units, 288 Chromium, 231 compatibility and 35 offline
cases, plus the production planner benchmark smoke.

Final source passed all twelve production overview/comfortable-space journeys,
two production offline and two Chromium overview journeys. Sixteen existing
board-space cases also passed. Light/dark phone/tablet screenshots were inspected;
no untranslated Latin kind/points labels remain in Chinese rows. An interrupted
local compatibility run had no completed report; its reruns completed and passed.
