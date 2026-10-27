# Confident and comfortable play

Publish each phase separately to main. Require the complete exact-commit CI
workflow before starting the next phase. Keep browser-only/offline play,
English/Simplified Chinese, strict tile/board geometry and existing game rules.
Physical-device, older-player and native Mandarin acceptance remain paused;
multiplayer remains deferred.

| Phase | Status | Scope |
| --- | --- | --- |
| 1. Smarter in-game help | Published; exact-commit CI required before Phase 2 | Locate affected tiles, identify the meld and distinguish a local repair from a complete turn. |
| 2. Bot difficulty and fairness | Pending | Reassess production behavior on fresh deals and make capabilities and public move explanations clear. |
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
