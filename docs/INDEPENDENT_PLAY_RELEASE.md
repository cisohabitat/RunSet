# Easier independent play release evidence

Four separately published implementation phases. Every preceding phase's complete
exact-commit CI passed before the next phase began. Human validation remains
paused and multiplayer remains deferred.

| Phase | Accepted commit | CI evidence |
| --- | --- | --- |
| Simple home | f5fb445 | [40480099367](https://github.com/cisohabitat/RunSet/actions/runs/40480099367) |
| Meld magnifier | f7d4419 | [40484343132](https://github.com/cisohabitat/RunSet/actions/runs/40484343132) |
| Clear touch feedback | b8508e0 | [40495430960](https://github.com/cisohabitat/RunSet/actions/runs/40495430960) |
| Caregiver setup guide | Final guide commit in this release | [Exact main-commit CI](https://github.com/cisohabitat/RunSet/actions?query=branch%3Amain) must pass before acceptance |

## Behaviour

Simple home is optional and preserves shared save/resume context. Secondary
practice, rules, deletion and backup tools remain available. A failed optional
home download recovers the full home while preserving saved play and preferences.

Zoom opens a read-only meld magnifier with 64×88 tiles, joker values and rule
explanations. The selected-count control previews mixed selections neutrally.
Placement confirmation observes actual physical relocation; rejected moves keep
selection, and stale marks clear on synchronized edits. The board retains its
standard density, comfortable controls and expanded workspace floors.

Settings → Set up together is an optional five-step checklist in English and
Simplified Chinese. Its language control shares the header implementation. The
display shortcut focuses the existing reading checkbox. The guide explains sound,
pace and default untimed Easy games without applying presets, starting a game or
playing audio. A failed dictionary download is readable inside the open dialog;
English remains usable. Timed games retain their absolute deadline.

## Verification

Final local verification includes TypeScript/build, the seven translation tests,
14 existing reading/Settings/Simple-home flows, six new production WebKit/Firefox
guide flows and the failed-download Chromium regression. Guide coverage starts
offline before the first Settings/Chinese visit and checks real preference changes,
selection, byte-identical saved game, timed context, focus, reload, overflow and
Axe. Phone coverage includes 320 CSS px; tablet coverage includes iPad landscape.
Screenshots were inspected in both languages and themes.

The unchanged initial HTML/CSS/JS limit passes at 99,987 gzipped bytes against
100,000. Settings and Chinese remain separately loaded and precached; no runtime
dependency or save schema was added. Final full CI contains 129 unit tests,
276 Chromium cases, 171 production compatibility cases, 19 offline cases and the
planner benchmark smoke. Preserve the twenty-minute complete job limit.

Phase 3 CI caught comfortable-phone overflow and reduced table space. Concise
labels and bounded padding fixed them without smaller text, tiles or hit targets.
Permanent production geometry cases retain >=300 px visible expanded-phone table
space and >=48 px comfortable controls. The complete corrected CI passed.

Phase 1's 24 live home/recovery/offline cases, Phase 2's six live magnifier cases,
and Phase 3's 12 live touch/comfortable-phone cases passed after their matching
Vercel deployments became ready. Final guide live checks must target its matching
ready deployment; a queued deployment is not live acceptance.

Physical iPhone/iPad tests, older Mandarin-speaking player sessions and native
Mandarin listening acceptance have not run and remain paused. Linux WebKit
emulation and automated playback do not establish those results. No AAA or human
usability acceptance is claimed.
