# Reliability and accessibility cycle

Approved after the decision-clarity cycle completed at
`b63af0ab02b981c621ca8fd0568a35c347e0bdf6`: complete twelve-job
[CI 41152053508](https://github.com/cisohabitat/RunSet/actions/runs/41152053508),
matching READY production and all 56 hosted checks in
[41153741446](https://github.com/cisohabitat/RunSet/actions/runs/41153741446).

| Phase | Work | Status |
| --- | --- | --- |
| 1 | Reduce initial startup assets and check slower-browser responsiveness | Complete: 366f6cd; CI 41159506733 and 64 matching hosted checks in 41160974451 passed |
| 2 | Review 200% enlargement, large text, keyboard navigation and bilingual accessible labels | Complete: dff9251; CI 41175960142 and 72 matching hosted checks in 41177284740 passed |
| 3 | Connect existing mistake guidance clearly to relevant practice | Complete: fa9e8ed; CI 41185578165 and 96 matching hosted checks in 41187009871 passed |
| 4 | Review accumulated CSS overrides, duplicate guidance and regression coverage | Cascade cleanup implemented; its own exact-commit gate required |

Publish each phase separately to main, update README and AGENTS, and complete
all twelve exact-commit CI jobs plus matching READY production and hosted
acceptance before starting the next phase. The current release review retains
all 72 earlier cases and adds 24 correction-to-practice journeys: 96 total.

## Phase 1 boundaries

See [the startup review](STARTUP_REVIEW.md). Keep React, classic rules, native
targets, table floors, timers, save schemas, worker budgets, offline readiness
and explicit update consent unchanged. The 100,000-byte initial gzip gate stays
in place. Deferred screen styles must load before their screens render, remain
in the offline cache and preserve their internal cascade order. Shared styles
remain available to every consumer.

Later phases begin with a review of the existing behavior; fix demonstrated gaps
without adding permanent board controls or duplicating lessons. Browser evidence
must identify its scope. Physical iPhone/iPad Safari, older Chinese-speaking
beginner sessions and native Mandarin listening remain paused. Screen-reader
labels and browser checks do not establish human screen-reader usability.
Multiplayer remains deferred.

## Phase 2 boundaries

See [ENLARGEMENT_REVIEW](ENLARGEMENT_REVIEW.md). Preserve full focus paint and
native targets without epsilon tolerances or corrective test scrolling. Separate
actual Chromium browser zoom/font APIs from viewport reflow evidence. Keep
profile/extension setup test-only, all prior offline cases and the full gate.
Phase 1 completed at 366f6cd with matching READY production; its implementation-
time pending-gate notes are historical.

## Phase 3 boundaries

See [MISTAKE_PRACTICE_REVIEW](MISTAKE_PRACTICE_REVIEW.md). Reuse the existing
public-position practice copy; never start or replace a saved short lesson,
exercise or whole-turn draft from move help. Carry the current reason/next step
read-only, close move help before opening practice, and return focus to its real
opener. Preserve the mounted regular game, selection, save and original deadline;
real state replacement/expiry invalidates the copy. Keep strict modal-body native
target bounds and the 12 px end padding/scroll clearance. Phase 2 completed at
dff9251 with matching READY production; its pending-gate notes are historical.

## Phase 4 boundaries

See [CASCADE_REVIEW](CASCADE_REVIEW.md). Remove only earlier declarations with
the same selector, media/supports context, property and importance as a later
supported declaration. Keep the winning rule positions, specificity, shorthand
order, responsive conditions and lazy stylesheet ownership. Retain conditional
guidance and timer/copy warnings when they serve distinct contexts. Preserve all
921 browser and 96 hosted cases and their native geometry/assertion budgets.
Phase 3 completed at fa9e8ed with matching READY production; its pending-gate
notes are historical. This phase requires its own full publication gate.
