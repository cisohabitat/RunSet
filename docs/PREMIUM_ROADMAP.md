# Premium improvement cycle

Each phase is a separate release to `main`. GitHub Actions must pass for that
exact commit before implementation of the next phase begins. This cycle builds
on the completed accessibility, guidance, results and board-space work; the
older-player study remains paused. Multiplayer remains deferred.

| Phase                    | Status      | Deliverable and gate                                                                                                                                                                        |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Reliable opponents    | Implemented | Complete-turn joker validation, legal alternatives, rack-empty shortcut and a 240 ms work cap. See [measured results](PREMIUM_BOTS.md); exact-commit CI gates the next phase. |
| 2. Clear play flow       | Implemented | Returning players get Continue first; quick setup with optional advanced controls; view controls explain their effect and preserve the current game.                                        |
| 3. Visual consistency    | Implemented     | Shared visual tokens, readable hierarchy, coordinated light/dark surfaces and focus states; English/Chinese phone, tablet and desktop screenshots.                                          |
| 4. Movement and feedback | Implemented     | Clearly distinguish newly played tiles, restrained placement/turn/round feedback, quiet sounds and reduced-motion equivalents.                                                              |
| 5. Focused learning      | Implemented     | Short opening, extension, incomplete-meld and joker exercises with concrete explanations; practice never replaces a regular save.                                                           |
| 6. Consistent narration  | Planned     | Optional cached Mandarin/English audio where available, polished short scripts and readable fallback. Device speech stays available; pronunciation and cheerful delivery need human review. |
| 7. Solo replay value     | Planned     | Replayable seeded practice, local progress and gentle milestones, isolated from regular saves and without accounts.                                                                         |
| 8. Human acceptance      | Paused      | Physical iPhone/iPad Safari and older Chinese-speaking beginners. Prepare a reproducible checklist, but do not claim these sessions ran.                                                    |

“Premium” here is a quality target, not a claim of AAA certification. Automated
Chromium viewport tests do not establish Apple device usability, audible voice
quality or enjoyment. Difficulty outcomes from reused seeds and swapped seats
are correlated; rule compliance is a release gate, win-rate ordering is not.

Release gate: Phase 1's application commit `ab202da` and CI mirror repair
`53e3fa8` are published. [CI 40358242463](https://github.com/cisohabitat/RunSet/actions/runs/40358242463)
passed for the exact repair commit before Phase 2 began. Local verification:
96 unit tests, 131 browser flows, ten offline flows and six live learning checks.

Phase 2's `37357a0` release and `a934892` timer correction are published.
[CI 40364692450](https://github.com/cisohabitat/RunSet/actions/runs/40364692450)
passed for the exact correction commit (137 browser flows) before Phase 3 began.

Phase 3's visual foundations and hint correction are published through `e0a7415`.
[CI 40371158085](https://github.com/cisohabitat/RunSet/actions/runs/40371158085)
passed (157 browser flows) before Phase 4 began. All 12 live foundation checks
also passed against the Vercel deployment.

Phase 4 passed [CI 40377305678](https://github.com/cisohabitat/RunSet/actions/runs/40377305678)
for `87ecc81` before Phase 5 implementation began.

Phase 5 adds [four focused exercises](PREMIUM_EXERCISES.md); its exact-commit CI
must pass before Phase 6 implementation begins.
