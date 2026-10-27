# Reliability and deeper learning cycle

Publish each phase to main; wait for exact-commit CI before the next begins.
Physical Apple sessions, older-player studies and native Mandarin listening stay
paused. Multiplayer remains deferred.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Cross-browser coverage | Published; CI passed | Production WebKit phone/tablet and Firefox desktop: touch/mouse moves, Undo, reload, view changes, real narration, offline assets. |
| 2. Review the last move | Published; CI passed | Read-only tile destinations from the latest completed play, with explicit limits for older saves. |
| 3. Targeted practice | Published; CI passed | Optional suggestions based on completed exercise kinds and final rack facts. |
| 4. Display choices | Implemented; CI gate pending | Optional high-contrast palette and landscape-phone checks. |
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

Phase 1 2826a27 passed CI 40459858493 before Phase 2 began. Phase 2 walks through
new tile destinations in the completed-turn snapshot. It preserves current drafts
and selection and explicitly avoids implying a chronological rearrangement replay.
Draw/pass turns and older saves without matching placement data offer no replay.

Review is available during the human turn and on results, so another bot's next
turn does not dismiss it mid-reading. Three unit checks cover modified drafts,
rack-empty finals and missing metadata. The compatibility gate also checks first
use after disconnecting; the new shared review chunk is precached.

Phase 2 local checks passed strict TypeScript, 121 unit tests and the production
build at 99,474 initial gzipped bytes. Chromium review flows passed in both
languages; compatibility coverage now includes modal Axe/focus/save checks and
first-use offline review. No regular save format or game rule changed.

Phase 2 0361d9a passed CI 40462033335 and all 36 live compatibility cases before
Phase 3 began. Firefox live TLS used the existing session CAs in a temporary NSS
profile; certificate verification stayed enabled.

Phase 3 offers one explained, optional practice idea when no exercise draft is
open. A completed unopened rack takes priority, then a retained joker, then the
first locally uncompleted goal. No rating or missed-move inference is made.
Results link to practice without replacing an existing exercise draft.

Phase 3 local checks passed strict TypeScript, 124 unit tests, seven Chromium
flows and production build at 99,491 initial gzipped bytes. Phone screenshots
were inspected in English/light and Chinese/dark. Compatibility checks reuse
the same recommendation flows rather than a second implementation.

Phase 3 e2d07a5 passed CI 40463428227 and all 21 live suggestion flows before
Phase 4 began. Phase 4 adds a separate runset.contrast preference with light/dark
palettes. It changes colours and boundaries, preserving shapes, tile dimensions,
current selection, saved positions and comfortable reading.

Phase 4 local checks passed strict TypeScript, all 124 unit tests and the
production bundle at 99,736 initial gzipped bytes. Thirteen new Chromium flows
measure tile text at >=7:1, check both themes/languages, iPad landscape and short phone landscape,
scan incomplete melds with Axe, and verify selection, dimensions, reload,
delete retention and comfortable reading. WebKit/Firefox reuse these flows.

All 39 new production WebKit/Firefox contrast flows passed locally. Phone and
iPad landscape screenshots were inspected in both themes. The complete CI gate
now includes 256 Chromium cases, 96 compatibility cases and 19 offline cases.
