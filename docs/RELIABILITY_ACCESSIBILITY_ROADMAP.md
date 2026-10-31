# Reliability and accessibility cycle

Approved after the decision-clarity cycle completed at
`b63af0ab02b981c621ca8fd0568a35c347e0bdf6`: complete twelve-job
[CI 41152053508](https://github.com/cisohabitat/RunSet/actions/runs/41152053508),
matching READY production and all 56 hosted checks in
[41153741446](https://github.com/cisohabitat/RunSet/actions/runs/41153741446).

| Phase | Work | Status |
| --- | --- | --- |
| 1 | Reduce initial startup assets and check slower-browser responsiveness | Scoped screen CSS implemented; its own exact-commit CI and live gate required |
| 2 | Review 200% enlargement, large text, keyboard navigation and bilingual accessible labels | Planned |
| 3 | Connect existing mistake guidance clearly to relevant practice | Planned |
| 4 | Review accumulated CSS overrides, duplicate guidance and regression coverage | Planned |

Publish each phase separately to main, update README and AGENTS, and complete
all twelve exact-commit CI jobs plus matching READY production and hosted
acceptance before starting the next phase. The current release review retains
all 56 earlier cases and adds eight cold stylesheet-loading checks: 64 total.

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
