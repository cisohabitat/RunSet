# Comfort and memory release evidence

Four separately published phases: visit-only public-turn replay; independent
display theme; local completed-round history; Chinese-first fresh games/copy.
The complete exact-commit workflow passed before each following phase started.

| Phase | Published revision | Complete CI | Unit / browser checks | Live checks |
|---|---|---|---|---|
| 1 · Public-turn replay | e0da620e8fb11362d0368687bfc21c2813a313ac | [40692437516](https://github.com/cisohabitat/RunSet/actions/runs/40692437516) | 194 / 667 | 6 passed |
| 2 · Display choice | 19572bd568d7d7acb15a221e48d63004f36a5b2b | [40695653069](https://github.com/cisohabitat/RunSet/actions/runs/40695653069) | 195 / 677 | 6 passed |
| 3 · Recorded rounds | 1b607c5ddd5c666446ed52ae9796882feae9e40f | [40698781025](https://github.com/cisohabitat/RunSet/actions/runs/40698781025) | 200 / 687 | 6 passed |

Each gate includes quality, Chromium, separate WebKit phone/iPad and Firefox
jobs, offline and aggregate check. Matching production commits reached READY
through the existing Git integration. No direct deploy/promote was used.

## Final phase verification

All 202 unit tests passed. The six existing Chinese language/learning/save
journeys passed. The new fresh-game journey covers three named computers,
literal human/saved/imported names, unchanged selection and timed saved bytes
on language changes, real replacement cancellation/acceptance, restart,
original-deadline backup import/reload, native touch targets and full-game Axe.
The computer-start deal also checks native rack keyboard focus and actual
horizontal scrolling without enabling gameplay during a computer turn.

Local testing exposed the existing disabled-rack scroll-accessibility bug and
fixed its focusable parent. An initial test-clock attempt froze React's lazy
fallback commits; the final regression fixes Date while browser timers run.
No accessibility rule, timeout or geometry assertion was weakened. Existing
bilingual replay and history regressions passed after the wording changes.
Phone/tablet screenshots were inspected for the new controls, Chinese names,
wrapping and visible scores.

Final build: 99,663 gzip bytes of initial HTML/referenced assets under the
unchanged 100,000-byte limit; 76 files precached. Optional review/history/settings
remain lazy. All game/save guards, absolute timers, physical tile sizes, strict
expanded-board floors, dependencies and full CI coverage remain in place.

## Publication and handoff gate

The final phase is published with this document. Its release gate is the
[Actions workflow attached to that exact main commit](https://github.com/cisohabitat/RunSet/actions?query=branch%3Amain),
including every browser job and aggregate check; it must complete successfully
before final handoff. Confirm matching production READY, then repeat the four
bilingual replay/theme/history/fresh-game journeys on WebKit phone, iPad and
Firefox (24 live cases). Do not infer CI success solely from deployment READY
or from this document. The final handoff links the verified workflow result.

## Scope and limits

Replay keeps six completed public turns for the current visit, not a full saved
event log. Reload/replacement clears it. History counts only its latest 30
observed real finishes; it is device-only and excluded from backups/profiles.
No lifetime/skill, inferred intention or human-opponent claim is made. Theme and
history failures never block play. New Chinese names are explicitly computers;
existing games and recorded lesson characters retain literal names.

Physical older-player/device study remains paused. Automated WebKit viewports,
mocked clock/audio and keyboard checks do not establish native Mandarin quality,
older-player comprehension, physical Apple latency or battery life. Multiplayer
remains deferred.
