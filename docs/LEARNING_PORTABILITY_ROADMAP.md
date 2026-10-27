# Deeper learning and portable progress

Publish each phase to main; require the complete exact-commit CI workflow before
starting the next. Keep English/Simplified Chinese, browser-only play, default
rules, strict device geometry and offline support. Multiplayer stays deferred;
physical-device, older-player and native Mandarin acceptance remains paused.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. More whole-turn lessons | Published; CI passed | Extension, rearrangement, joker replacement/reuse and choosing Draw. |
| 2. Varied practice hands | Published; CI passed | Several layouts per skill, optional hints and fewer prompts. |
| 3. Portable progress | Published; CI passed | Optional profile export/import with learning and display settings, keeping game-only backups. |
| 4. Clearer recovery | Published; final CI acceptance checked after push | Review replacement scope and resume interrupted practice with clear context. |

Phase 1 extends the bounded action transcript with an optional lesson ID; legacy
records without it remain opening practice. New lesson goals must be satisfied
before an actual End turn. Drawing completes only the draw-decision lesson; in
other lessons it gives a factual non-completion outcome. A lesson selection is
only a proposal until Start selected lesson, with replacement scope visible.
Regular games and short lessons stay independent. Guided/quiet attempts, read-only
results, Undo/Reset, explicit Listen and offline resume remain available.

Phase 1 local verification passed 149 units, typecheck/build, all eight new
production offline Chromium/WebKit/Firefox lesson journeys and eight existing
lesson/keyboard/recovery regressions. English light and Chinese dark screenshots
were inspected. Initial download: 99,524 gzip bytes under the unchanged 100,000
budget; 58 precached assets. The full CI gate retains 282 Chromium, 207
compatibility and 27 offline cases, plus units and benchmark smoke.

Phase 1 commit 6e07957 passed complete CI 40541754858 before Phase 2. Vercel
remained QUEUED independently at that gate; live acceptance is still pending.

Phase 2 adds four deterministic layouts per lesson by bijective colour rotation
and fresh-rack shuffling. Goal sets, clue IDs, English/Chinese instructions and
physical positions transform together. Numbers/rules stay the same; no skill
rating or difficulty ranking is inferred. Missing layout IDs preserve legacy
layout zero. Next layout is explicit, keeps the lesson and guidance mode, and
starts a fresh attempt. Restart repeats the same layout; step visibility keeps
selection and draft. All twenty lesson/layout combinations have valid solutions.

Local Phase 2 verification passed 155 units, typecheck/build, twelve production
WebKit/Firefox layout/lesson journeys, four production offline Chromium cases
and two keyboard/recovery regressions. Light/dark screenshots were inspected.
Initial gzip download: 99,526 bytes under 100,000; 58 precached assets. The full
gate retains 282 Chromium, 213 compatibility and 29 offline cases plus units
and benchmark. Phase 1's matching Vercel release subsequently became READY.

All six Phase 1 live lesson journeys passed on its matching READY release
before Phase 2 publication. Phase 2 also checked runtime errors on the offline
Chinese layout journey; none occurred.

Phase 2 commit 69f4c7d passed complete CI 40545701245 before Phase 3. Its matching
READY Vercel release passed six bilingual live layout journeys.

Phase 3 adds optional Home → Portable progress, a lazy native dialog for one
validated file containing the game, four learning formats and supported view/
sound preferences. Opening a file is read-only. The game can be excluded from
restoration; absent keys remain. Successful restoration reloads to apply initial-
read preferences/I18n, retaining original turn, deadline and Undo history. Old
game-only backups remain unchanged. No account, backend or credentials are added.

The profile codec has a strict versioned key/value allowlist, byte-size limit and
pure nested validators. Imported practice replays its known lesson/layout and
rejects explicit invalid identifiers; missing legacy fields remain compatible.
Profile commits share persistGame's lock, generation and expected-value guards.
They snapshot affected keys, attempt rollback on write failure and never reload
after failure or owned cancellation. Rollback failures are reported honestly.

Local verification passed 160 units, all 31 production offline cases, six new
WebKit/Firefox profile journeys, two Chromium phone profile journeys and fourteen
existing backup/recovery/keyboard regressions. Tests export actual files, reject
malformed data, inject quota failure, check exact rollback, retain a recipient
game when excluded and resume an imported quiet joker layout mid-turn. Native
Restore/Done footer controls stay fully visible at >=48 px; failure feedback
receives focus and lies within the scroll region. Light/dark screenshots were
inspected. Final build: 99,885 initial gzip bytes under 100,000; 63 precached
assets. Full CI retains 282 Chromium, 219 compatibility and 31 offline cases,
plus 160 units and benchmark smoke, before Phase 4 starts.

Phase 3 commit 26f3518 passed complete CI 40551666374 before Phase 4. Its matching
READY live release passed six bilingual profile-transfer journeys.

Phase 4 adds current/incoming game and practice comparisons, explicit opt-in to
replace an existing game, friendly preference scope, original-deadline context
and restored-practice messages. Backup confirmation says Restore backup; fresh
deals retain Start new game. A legal extra fourth tile no longer prevents the
joker lesson goal. The profile reader now enforces the practice reader size cap.

Final local verification passed 164 units, typecheck/build, all 31 production
offline cases, six bilingual production WebKit/Firefox profile journeys and
fourteen backup/result/replay regressions. The profile journeys transfer between
opposite UI languages, cancel previews, check exact quota-failure rollback and
finish imported interrupted joker practice. Light/dark phone/tablet screenshots
were inspected. Initial gzip: 99,903 bytes under the unchanged 100,000-byte
budget; 63 precached assets. The full final workflow retains 284 Chromium,
219 compatibility and 31 offline cases, plus units and benchmark smoke.
Exact-commit CI and matching READY live acceptance are checked after publication;
see [release evidence](LEARNING_PORTABILITY_RELEASE.md) and main workflow history.
