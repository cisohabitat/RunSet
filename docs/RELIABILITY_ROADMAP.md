# Reliability and deeper learning cycle

Publish each phase to main; wait for exact-commit CI before the next begins.
Physical Apple sessions, older-player studies and native Mandarin listening stay
paused. Multiplayer remains deferred.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Cross-browser coverage | Implemented; CI gate pending | Production WebKit phone/tablet and Firefox desktop: touch/mouse moves, Undo, reload, view changes, real narration, offline assets. |
| 2. Review the last move | Queued | Read-only tile destinations from the latest completed play, with explicit limits for older saves. |
| 3. Targeted practice | Queued | Optional suggestions based on completed exercise kinds and final rack facts. |
| 4. Display choices | Queued | Optional high-contrast palette and landscape-phone checks. |
| 5. Longer-session comfort | Queued | Clear break/resume context and opponent pacing, preserving timer semantics. |

Phase 1 uses Playwright WebKit on Linux, not physical Safari/iOS. Firefox runs
mouse input; WebKit uses actual touchscreen taps in coarse-pointer contexts.
All new coverage runs against the production build. Existing Chromium, offline,
unit and benchmark gates remain intact. No browser exclusions hide failures.

Phase 1 adds 24 production compatibility flows. Linux headless Firefox needs a
virtual audio sink; absence produced OnMediaSinkAudioError, resolved with a null
PulseAudio output. Narration failure routes block service workers so aborts
cannot be masked by cached successful audio; separate offline tests retain SWs.
A genuine never-resolving media-start fixture now verifies a 10-second startup
watchdog and cancellation on Stop. Audio never starts automatically.

Local release checks: strict TypeScript/production build (99,419 initial gzipped
bytes), 118 unit tests and all 24 compatibility flows passed. Screenshots were
inspected in WebKit phone/light and tablet/dark. The final exact-commit CI gate
includes the original Chromium, 19 offline and benchmark suites.
