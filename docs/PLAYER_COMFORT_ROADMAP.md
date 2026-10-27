# Confident and comfortable play

Publish each phase separately to main. Require the complete exact-commit CI
workflow before starting the next phase. Keep browser-only/offline play,
English/Simplified Chinese, strict tile/board geometry and existing game rules.
Physical-device, older-player and native Mandarin acceptance remain paused;
multiplayer remains deferred.

| Phase | Status | Scope |
| --- | --- | --- |
| 1. Smarter in-game help | Published; full CI and live checks passed | Locate affected tiles, identify the meld and distinguish a local repair from a complete turn. |
| 2. Bot difficulty and fairness | Published; exact-commit CI required before Phase 3 | Reassess production behavior on fresh deals and make capabilities and public move explanations clear. |
| 3. Crowded-board readability | Pending | Improve long-game meld navigation without shrinking touch targets or the table. |
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
