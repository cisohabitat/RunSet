# Deeper learning and portable progress

Publish each phase to main; require the complete exact-commit CI workflow before
starting the next. Keep English/Simplified Chinese, browser-only play, default
rules, strict device geometry and offline support. Multiplayer stays deferred;
physical-device, older-player and native Mandarin acceptance remains paused.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. More whole-turn lessons | Published; CI passed | Extension, rearrangement, joker replacement/reuse and choosing Draw. |
| 2. Varied practice hands | Published; CI gate | Several layouts per skill, optional hints and fewer prompts. |
| 3. Portable progress | Queued | Optional profile export/import with learning and display settings, keeping game-only backups. |
| 4. Clearer recovery | Queued | Review replacement scope and resume interrupted practice with clear context. |

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
