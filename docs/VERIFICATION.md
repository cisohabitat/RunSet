# Roadmap verification

Verification date: 2026-10-25. This records automated checks in the development
environment; it does not certify physical Apple devices or live multiplayer.

## Automated results

- `npm run typecheck`: passes with strict TypeScript.
- `npm test`: 49 tests pass, including seeded simulations of more than 4,000 legal
  bot turns, tile conservation, practice states, hint planning, undo boundaries,
  persistence, cumulative scoring, round continuation, and timer expiry.
- `npm run test:e2e`: seven Chromium flows pass: guided learning/save isolation/
  delete/device resizing; hint preview/placement and penalties; undo/restart;
  fifty-tile racks and crowded tables; matches/resume/timers; timed confirmation
  races; and bot-turn deletion plus storage failures.
- `npm run test:offline`: two production Chromium flows pass: saved games and lazy
  practice assets after an offline reload; and explicit service-worker updates
  preserving the saved game. The update test waits for the actual reload before
  reading storage.
- `npm run build`: passes and emits a static application plus versioned offline
  cache. The main JavaScript bundle is approximately 85 kB gzipped; optional
  practice and worker assets are separate.

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
- A real server-backed multiplayer integration and two-device games: workspace
  access and store provisioning are blocked as described in MULTIPLAYER.md.
- Vercel deployment status for each pushed commit: publishing to `main` is
  confirmed separately from Vercel completing its automatic build.
