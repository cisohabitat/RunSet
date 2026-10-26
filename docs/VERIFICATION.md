# Roadmap verification

Verification date: 2026-10-26. This records automated checks in the development
environment; it does not certify physical Apple devices. Online multiplayer is
explicitly deferred and excluded from active release requirements.

## Automated results

- `npm run typecheck`: passes with strict TypeScript.
- `npm test`: 76 tests pass, including seeded simulations of more than 4,000 legal
  bot turns, tile conservation, practice states, hint planning, undo boundaries,
  persistence, cumulative scoring, round continuation, and timer expiry.
- `npm run test:e2e`: 47 Chromium flows pass: guided learning/save isolation/
  delete/device resizing; hint preview/placement and penalties; undo/restart;
  fifty-tile racks and crowded tables; matches/resume/timers; timed confirmation
  races; and bot-turn deletion plus storage failures.
- `npm run test:offline`: five production Chromium flows pass: saved games and lazy
  practice assets after an offline reload; and explicit service-worker updates
  preserving the saved game. The update test waits for the actual reload before
  reading storage.
- `npm run build`: passes and emits a static application plus versioned offline
  cache. The main JavaScript bundle is approximately 89 kB gzipped; optional
  practice, rules, Chinese dictionary and worker assets are separate.

## Layout coverage

Automation exercises representative 360, 375, 390, 430, 768, 820, 1180, and 1440 px
widths, including portrait and landscape sizes, minimum tile touch targets,
contained scrolling, and enlarged racks. This is Chromium viewport coverage,
not physical iPhone/iPad Safari coverage.

## Checks still requiring people or external access

- Actual iPhone and iPad Safari, touch gestures, safe areas, Split View, rotation,
  on-screen keyboard, text enlargement, and Home Screen installation.
- Current macOS Safari and Firefox, VoiceOver, and assistive-technology usability.
- The planned five-person first-time-player study and its four-of-five completion
  target. No participants or results have been fabricated.
- Vercel deployment status for each pushed commit: publishing to `main` is
  confirmed separately from Vercel completing its automatic build.

The current cycle adds cross-tab deletion/conflict tests, exact advanced lesson
goals, confirmation-time timer start, keyboard-only play, control/table overlap,
coached learning, validated backups/recovery, and verified offline readiness.
GitHub Actions success must be checked for each pushed SHA before proceeding.

Phase 5 adds delayed-worker startup with a 4× CPU-throttled responsiveness check,
a table-rearranging hint regression, and six recorded fixed-deal/seat-rotation
games. The measured host and limitations are in BENCHMARKS.json and BENCHMARKS.md.
Phase 4 GitHub Actions run 40246103183 passed all checks before phase 5 began.

Production builds enforce a 100,000-byte gzip budget for the initial HTML and its
referenced CSS/JS. Optional practice and worker assets are measured separately,
not silently included in an initial-load claim.

Learn-to-Play regression coverage completes basics, joker retrieval/reuse, and
rearranging at phone/tablet touch sizes and desktop mouse size. It also checks
practice resume, regular-save isolation, Undo/Reset after acknowledging the
opening, and recovery of older practice saves stuck on End turn.

Additional tutorial regressions check Restart clears old selections and early
Draw/End actions explain the current objective without changing progress.
Tutorial continuation controls are checked with viewport bounds and hit-testing
before clicking, so automatic Playwright scrolling cannot hide clipped controls.

The fresh review in BUG_REVIEW.md adds exact hint reload/Undo, damaged history
recovery, mixed-edit save validity, generated group ID uniqueness, late-action
expiry, legal joker splits, tutorial destination checks, and combined-option
layout bounds down to 360×640.

The visual review adds light/dark checks for unclipped lesson navigation and
instructions, visible hint placement, wide-screen table tools, and at least
4.5:1 tile-text contrast. See VISUAL_REVIEW.md for reviewed screens and changes.

The supplied-playtest follow-up adds the exact 1180×757 laptop layout (normal
and large tiles with Hint and Expand/Compact), empty-pool Pass guidance, and
explicit optional-lesson completion with a retained final table on phone/laptop.
See PLAYTEST_FOLLOWUP.md for mapping to RS-01 through RS-03.

Simplified Chinese coverage adds all three lessons at phone/iPad/laptop sizes,
language switching with a live tile selection, browser-language detection and
persisted overrides, backup errors, save/name preservation, safe deletion,
empty-pool hints/timers, results and a narrow-phone menu. The fourth offline
flow switches to Chinese after disconnecting (before fetching the dictionary),
reloads, opens practice and rules, then switches back to English. Chinese
screenshots were inspected in light/dark Chromium; actual Apple devices and
comprehension testing with older Chinese speakers remain manual checks.
See LOCALIZATION.md.

Comfortable reading adds eight browser flows: both languages complete all three
lessons at phone/tablet/laptop sizes, with larger text and tiles, hit-tested
controls, visible selection check marks, no horizontal page overflow, and
selection/save preservation when toggling the mode. Preferences persist across
reload/deletion; Done/Escape restore focus. A timed-game check confirms expiry
continues while Settings is open. The fifth offline flow opens Settings for the
first time after disconnecting and retains reading mode on reload. See
READING_MODE.md. Phase 1 human/device testing remains paused by the user.
