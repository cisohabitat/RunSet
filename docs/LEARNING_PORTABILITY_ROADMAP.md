# Deeper learning and portable progress

Publish each phase to main; require the complete exact-commit CI workflow before
starting the next. Keep English/Simplified Chinese, browser-only play, default
rules, strict device geometry and offline support. Multiplayer stays deferred;
physical-device, older-player and native Mandarin acceptance remains paused.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. More whole-turn lessons | Published; CI gate | Extension, rearrangement, joker replacement/reuse and choosing Draw. |
| 2. Varied practice hands | Queued | Several layouts per skill, optional hints and fewer prompts. |
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
