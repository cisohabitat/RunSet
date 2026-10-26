# Premium improvement cycle

Each phase is a separate release to `main`. GitHub Actions must pass for that
exact commit before implementation of the next phase begins. This cycle builds
on the completed accessibility, guidance, results and board-space work; the
older-player study remains paused. Multiplayer remains deferred.

| Phase                    | Status      | Deliverable and gate                                                                                                                                                                        |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Reliable opponents    | Implemented | Complete-turn joker validation, legal alternatives, rack-empty shortcut and a 240 ms work cap. See [measured results](PREMIUM_BOTS.md); exact-commit CI gates the next phase. |
| 2. Clear play flow       | Planned     | Returning players get Continue first; quick setup with optional advanced controls; view controls explain their effect and preserve the current game.                                        |
| 3. Visual consistency    | Planned     | Shared visual tokens, readable hierarchy, coordinated light/dark surfaces and focus states; English/Chinese phone, tablet and desktop screenshots.                                          |
| 4. Movement and feedback | Planned     | Clearly distinguish newly played tiles, restrained placement/turn/round feedback, quiet sounds and reduced-motion equivalents.                                                              |
| 5. Focused learning      | Planned     | Short opening, extension, incomplete-meld and joker exercises with concrete explanations; practice never replaces a regular save.                                                           |
| 6. Consistent narration  | Planned     | Optional cached Mandarin/English audio where available, polished short scripts and readable fallback. Device speech stays available; pronunciation and cheerful delivery need human review. |
| 7. Solo replay value     | Planned     | Replayable seeded practice, local progress and gentle milestones, isolated from regular saves and without accounts.                                                                         |
| 8. Human acceptance      | Paused      | Physical iPhone/iPad Safari and older Chinese-speaking beginners. Prepare a reproducible checklist, but do not claim these sessions ran.                                                    |

“Premium” here is a quality target, not a claim of AAA certification. Automated
Chromium viewport tests do not establish Apple device usability, audible voice
quality or enjoyment. Difficulty outcomes from reused seeds and swapped seats
are correlated; rule compliance is a release gate, win-rate ordering is not.
