# Learning from play and personal comfort

Approved 2026-10-28. Complete and publish four phases separately to main, requiring
each complete exact-commit CI workflow (quality, every browser job, aggregate
check) to pass before the next phase. Use existing Git/Vercel integration.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Recent public-turn replay | Published; exact-commit CI pending |
| 2 | Light / Dark / Follow device display choice | Pending |
| 3 | Local completed-round history and factual statistics | Pending |
| 4 | Chinese-first fresh opponent names and plain wording | Pending |

Physical older-player/device study stays paused. Native Mandarin listening and
battery acceptance remain unverified. Multiplayer remains deferred.

## Phase 1

More → Help with this turn and results offer Replay recent turns. It records up
to six completed public turns during the current page visit, retaining frames
across Home navigation. Reloading, replacement and fresh games clear the replay.
This scope is explicit in the panel. No new storage key or save/profile schema.

Frames contain turn number, literal actor, original public turn-start board,
completed public board and added public IDs only. No hidden rack/pool allocation,
clocks, scores or private logs. No intermediate edit order or bot intent is
invented. Before/After and Previous/Next controls are explicit; no autoplay.
Regular game state and selection stay mounted and unchanged; actual deadlines
continue and turn/state replacement closes the stale dialog. Native opener focus
and guarded WebKit retry are retained. Replay CSS/component stay lazy/precached.

Four projection/ring regressions plus translation audit passed. The initial
browser journeys cover a real human turn, actual bot handoff, before/after,
selection/save/deadline invariance, native targets/focus, Axe, final winning turn,
expiry and reload clearing. Final build initial gzip: 99,300 bytes under the
unchanged 100,000-byte budget; 73 precached files.

Local verification: all 194 unit tests and ten bilingual browser journeys passed
across Chromium, WebKit phone/iPad, Firefox and offline production. Phone Chinese
and iPad English screenshots reviewed: controls and public boards remain legible.
Publication is gated on the complete exact-commit GitHub Actions workflow before
Phase 2 begins.
