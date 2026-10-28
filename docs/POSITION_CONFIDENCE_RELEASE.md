# Position-confidence release evidence

Approved scope: phases 1–3, published separately with complete exact-main CI
success required before starting each next phase. Phase 4 physical study paused.

| Phase | Main commit | Complete accepted CI |
|---|---|---|
| Temporary position practice | 0192c6a | [40650578708](https://github.com/cisohabitat/RunSet/actions/runs/40650578708), success |
| Display-only table arrangement | 8eecb70 | [40654155816](https://github.com/cisohabitat/RunSet/actions/runs/40654155816), success |
| Return-to-game guidance | Commit containing this document | [Main CI history](https://github.com/cisohabitat/RunSet/actions/workflows/ci.yml?query=branch%3Amain) |

Each of the first two phases also passed six bilingual matching live journeys
on READY production. Initial Phase 2 publication b418044 was superseded by the
malformed-profile-label correction before acceptance. No failed or superseded
gate is counted as accepted.

Phase 3 local type/unit/build checks passed: 186 unit tests, including the existing
seven rule-guidance tests covering opening thresholds, empty pool, waiting,
invalid edits and legal completion. Initial HTML and referenced assets total
99,249 gzip bytes under the unchanged 100,000-byte budget; 70 precached files.
Final local verification passed all 48 targeted journeys: ten Chromium, thirty
compatibility (ten per project) and eight offline.
The six repeated WebKit phone guidance journeys passed after the touch fix.
Complete exact-commit main CI and matching production/live acceptance are required
after publication; deployment readiness alone is not acceptance.

The browser release path connects saved-draft guidance, display organisation,
independent practice, actual repair/win, review and backup/delete/import recovery.
New home journeys check both variants, read-only exact saves, actual timer expiry,
English/light and Chinese/dark, larger text, native targets and accessibility.

These are automated browser results. Physical iPhone/iPad usability with older
Chinese-speaking players, native cheerful Mandarin listening and device battery
acceptance remain unverified. Multiplayer remains deferred.

A new normal-view Chinese comfortable-phone path exposed a repeatable WebKit
placement-button tap loss during native focus scrolling (three failures in three
repetitions, selected tile retained and no engine/history change). MeldTarget now
uses the existing tile/new-meld useTouchClick binding rather than changing game
rules or forcing test input. The regression stays in the original normal view.
An initial local concurrent run also collided in nested Playwright artifact
folders; subsequent suites use distinct output directories.

The first Phase 3 gate, [40657680301](https://github.com/cisohabitat/RunSet/actions/runs/40657680301)
on f5cf6b5, is not accepted: the older timed-break Home assertion expected the
previous timer sentence. The separate More-panel expectation remains unchanged.
The correction updates only that Home copy assertion and retains the exact
deadline, one-turn expiry, restored table and one-drawn-tile checks. The app
runtime is unchanged. A fresh full exact-main CI gate is required.

The corrected timed-break case passed locally in Chromium, WebKit phone/iPad
and Firefox (four journeys), including all original expiry invariants.
