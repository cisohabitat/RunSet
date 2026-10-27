# Roadmap verification

Verification date: 2026-10-26. This records automated checks in the development
environment; it does not certify physical Apple devices. Online multiplayer is
explicitly deferred and excluded from active release requirements.

## Automated results

- `npm run typecheck`: passes with strict TypeScript.
- `npm test`: 112 tests pass, including seeded simulations of more than 4,000 legal
  bot turns, tile conservation, practice states, hint planning, undo boundaries,
  persistence, cumulative scoring, round continuation, and timer expiry.
- `npm run test:e2e`: Phase 1's full 131 Chromium flows pass: guided learning/save isolation/
  delete/device resizing; hint preview/placement and penalties; undo/restart;
  fifty-tile racks and crowded tables; matches/resume/timers; timed confirmation
  races; and bot-turn deletion plus storage failures.
- `npm run test:offline`: ten production Chromium flows pass: saved games and lazy
  practice assets after an offline reload; and explicit service-worker updates
  preserving the saved game. The update test waits for the actual reload before
  reading storage.
- Premium Phase 2 adds six bilingual play-flow checks (137 total browser flows).
  Its final focused 70-flow suite and ten offline flows pass; exact-commit
  GitHub CI runs the complete suite before Phase 3. See [play flow](PREMIUM_PLAY_FLOW.md).
- Premium Phase 3 adds 12 theme/focus scenarios and eight deterministic long-hint
  phone cases (157 total browser flows). Its final focused 28-flow suite and ten
  offline flows pass; exact-commit CI gates Phase 4. See [visuals](PREMIUM_VISUALS.md).
- Premium Phase 4 adds five actual-state sound tests and five browser feedback
  scenarios (162 total browser flows). Its 40 focused flows and ten offline
  flows pass locally; exact-commit CI gates Phase 5. See [feedback](PREMIUM_FEEDBACK.md).
- `npm run build`: passes and emits a static application plus versioned offline
  cache. The main JavaScript bundle is approximately 84 kB gzipped; optional
  game UI, practice, rules, Chinese dictionary and worker assets are separate.

## Layout coverage

The [premium opponent follow-up](PREMIUM_BOTS.md) adds original-proposal
validation and held-out evaluations. The final 240 ms-cap reports cover 60 rounds
and 6,542 conserved turns, with zero rejected proposals and no measured calls
over 400 ms. The retained initial 320 ms-cap trial records one timing overrun;
these are Node measurements, not physical-device performance guarantees.

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

First-game guidance adds seven pure-helper tests and four browser flows. They
check opening thresholds, source validity after splitting, exact joker replacement
and reuse, state/Undo preservation, unknown tiles, bot/finished positions, Chinese
messages, selected-tile suggestions, 6/30 progress, safe reset, penalty cancellation,
setup opt-out and explicit empty-pool Pass help. Phone instruction bounds and the
1180×757 laptop hint/meld controls pass. A sixth offline flow visits lazy setup
for the first time after disconnecting and starts a guided game. See
FIRST_GAME_GUIDANCE.md. Phase 2 CI run 40292228237 passed before Phase 3 began.

Results/replay adds seven summary/settings helper tests and nine browser flows.
They cover rack-empty and blocked endings, seat-order ties, literal names, 30-point
remaining jokers, winner/loser arithmetic, continuing versus restarting a match,
a completed match, same-settings replay, cancellation, prefilled editable setup,
updated timer/target options, and backup restoration from a completed result.
Phone/tablet/desktop, Chinese/English, light/dark and comfortable/compact layouts
pass, including a long-name/104-tile rack case. The seventh offline flow opens
results for the first time after disconnecting, expands arithmetic and replays.
See RESULTS_AND_REPLAY.md. Phase 3 CI run 40295547425 passed before Phase 4 began.

The board-space fix adds 16 touch-emulated browser flows: populated boards in
English/Chinese, standard/comfortable modes and phone/portrait-iPad/landscape-iPad
sizes; visible complete melds, touch placement at the table end, hints and their
sticky actions, timer count, unchanged saves on view changes, turn/reload
persistence, Escape/focus, short landscape controls, native penalty cancellation,
round-end scrolling cleanup, and a roomier phone practice board. The eighth
offline flow opens the lazy game UI for the first time offline and resumes its
expanded preference. The short-laptop heading/meld/hint regression still passes.
See BOARD_SPACE.md for measured before/after examples and verification limits.

Optional read aloud adds six browser flows for explicit Mandarin/English speech,
replay/stop, instruction/language/exit cancellation, delayed or unavailable voices,
synthesis failure and a save-preserving expanded-view reminder. Two more offline
flows exercise first-use Chinese lessons with installed and network-only voices.
Audio tests mock the speech adapter and cannot verify audible pronunciation or
physical Apple playback. See READ_ALOUD.md.

The difficulty review adds 120 production-budget bot rounds (60 mixed, 60
head-to-head) on seeds 101–110 with every ordered seat assignment. All 12,940
turns preserve tiles and legal completed tables, but 229 original joker-related
proposals are rejected into draws/passes; submitted-plan legality is explicitly
false in the raw reports. Two Hard calls exceed 400 ms (max 436.22 ms). This
release changes evaluation tooling/docs only; it does not claim these planner
defects are fixed. See DIFFICULTY_REVIEW.md and its replayable examples.

The landscape-tablet follow-up adds eleven flows for 44×60 standard tiles,
smaller headers, one-row six-meld density, complete guidance, real touch play,
rotation/selection/save preservation, large display overrides, 50-tile racks,
three long opponent names with hints and unchanged mouse-only desktop sizes.
Screenshots cover English/Chinese and light/dark; see IPAD_LANDSCAPE.md.
Physical iPad Safari and actual safe-area/trackpad behavior remain unverified.

The phone-density follow-up adds twelve flows for 44×54 standard tiles at five
portrait/landscape sizes in both languages, unchanged number size, rack/meld
capacity, touch placement/Undo, selection/save preservation across rotation,
selected two-digit/joker readability and larger preferences with 50 tiles.
See PHONE_TILES.md for before/after measurements and physical-device limits.

Temporary rack hiding adds 26 browser flows for both languages/reading modes at
six phone/tablet sizes, >=60 px measured visible-table gains, actual moves/Undo/
hints, selection/save preservation, restoration on turn/exit/reload, native
penalty Escape and practice isolation. The existing offline game-view test now
uses Hide rack for the first time after disconnecting and verifies restoration.
See TABLE_INSPECTION.md for measurements and physical-device limits.

Premium Phase 5 adds three exercise engine regressions, four bilingual responsive
flows (166 configured browser flows) and first-use offline exercise coverage
(11 offline flows). Initial production transfer is 97,531 bytes gzipped.

Premium Phase 6 adds exact-caption MP3 coverage and three recorded-playback
flows (169 configured browser flows), preserving all device-voice checks.
Twelve production offline flows include first-use Mandarin MP3 playback without
Web Speech. Human/native-speaker and physical-device audio review remains paused.

Premium Phase 7 adds 400 reproducible solved exercise positions across 100
numbers/four goals, malformed-number checks and three bounded-progress/merge
regressions. Six new browser flows bring the configured total to 175; thirteen
offline flows include a new numbered puzzle. Dynamic Chinese captions are
checked for every sampled puzzle. Physical-device and native-listening results
remain untested, as recorded in PREMIUM_ACCEPTANCE.md.

A further exercise regression accepts a valid additional extension after the
stated goal is met; full-turn legality still gates completion.

Quality follow-up Phase 1: 360 fresh production-budget rounds on seeds 501–530,
39,212 turns, all original plans legal, all tile IDs conserved and unchanged
planner inputs. No call exceeded 400 ms on the recorded Node host. The benchmark
smoke now validates original plans, actual placement and pass/draw distinction.
See QUALITY_BOTS.md for raw data and correlated-seed limitations.

Quality Phase 2 adds ten browser flows (185 configured): 40 Axe screen scans
across English/Chinese and light/dark, route/skip/rack keyboard handling, full
keyboard basics lessons and 320 CSS px comfortable-reading reflow. It fixes
main landmarks, warning/rules contrast and lost focus between learning steps.
Physical VoiceOver/Apple zoom and beginner/native-listening checks remain paused.

Quality Phase 3 adds ten recovery and four crowded-board flows (199 configured
browser flows), rejected-lock and 1000-turn soak regressions (114 unit tests),
and four production-offline failure/update scenarios (17 offline flows).
Coverage includes a late move during worker activation and returning Home while
a reload waits on a save lock. Retained timings and limitations are documented
in QUALITY_RECOVERY.md. Phase 2 CI 40426493303 and all ten live accessibility
flows passed before this phase began.

Enjoyment phases 1–2 add four turn-clarity and five hint-preview flows (208
configured), including save isolation, modal Axe checks, Escape/focus, Undo and
timer expiry. First-use offline preview increases the offline suite to 18.
See ENJOYMENT_ROADMAP.md for per-phase exact-commit release gates.
