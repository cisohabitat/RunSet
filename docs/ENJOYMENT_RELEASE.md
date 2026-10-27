# Confidence and enjoyment release audit

This cycle improves the returning-player journey without changing tile rules,
physical tile sizes, bot search strategy or regular-save formats. See the
[phase record](ENJOYMENT_ROADMAP.md) for publication gates.

## Implemented journey

- Turn ownership names the active opponent, including compact phones. On-demand
  help remains available after coaching is dismissed and reports public last-turn
  facts. Multi-opponent wait guidance counts seats before the human.
- Hints offer a read-only, reducer-validated table preview with rack outlines,
  destination labels and rule explanations. Placement and End turn stay explicit.
- Setup compares post-opening capabilities and gives selected-style learning
  advice. Normal/Hard overlap is stated; gentle defaults remain one Easy bot,
  no timer, one round and guidance on.
- Results compare rack totals with their signed scores and offer one takeaway
  based on the actual final rack. Replay, match continuation and changing settings
  preserve their existing promises.
- Quick exercises offer a local-calendar daily puzzle and graduated rule/tile/step
  clues. A date change never replaces an open puzzle. No streak pressure, account,
  deadline or attendance log is introduced.

## Confirmed final-audit fixes

1. Holding a lazy Setup download reproduced a missing main landmark and broken
   skip target. Loading screens now retain a main-content target, heading and
   status message. Focus waits for real content rather than the loading heading.
2. Completing a real rack-empty turn reproduced loss of keyboard focus at results.
   Round completion is now a distinct focus transition. React can retain a hidden
   previous screen during Suspense, so heading selection checks rendered visibility
   and observes relevant visibility changes before completing the focus handoff.
3. At 320 CSS pixels with comfortable English text, opponent-count buttons forced
   their fieldset to 347.7 px and the document to 387 px. Scoped fieldset sizing
   and wrapping remove that overflow without reducing text or control targets.
   Shorter comparison headings avoid fragmented words in narrow columns.

4. Holding the results chunk after a real round finish reproduced two
   main-content IDs: the hidden old board and the new loader. Playing/results
   Suspense boundaries now have distinct keys, retiring the old board immediately
   so the native skip link always has one destination. App-owned save state stays
   outside those boundaries.

## Verification scope

The configured release suite contains 118 unit tests, 233 browser flows and 19
production-offline flows. Every phase also runs strict TypeScript, the production
bundle check and original-plan bot benchmark smoke in exact-commit GitHub CI.

Nine new loading flows hold actual lazy downloads, check Axe/landmarks/skip
navigation/final focus, or return Home before resolution. Six new returning-player
journeys cover English/Chinese at 320×640 comfortable reading, 390×844 standard
phone and 1180×820 standard landscape tablet. They visit setup/comparison, preview
and Undo, complete daily practice without overwriting the regular game, resume,
finish the regular round through the engine, inspect results and reopen settings.
They check viewport bounds, hit targets, saved state and runtime errors.

Existing audio, recorded-caption/fallback, reduced-motion feedback and interrupted
save/recovery flows remain in the audit. Automated adapter/playback checks do not
approve voice tone, Mandarin pronunciation or physical Apple audio behavior.
Screenshots cover English/light and Chinese/dark; the broader Axe suite covers
both themes in both languages. Responsive Chromium is not physical-device testing.

Final local checks passed: strict TypeScript, all 118 unit tests, all 19
production-offline flows, 34 new-cycle flows against the compiled production
assets, and affected accessibility/audio/animation/recovery checks. The final
playing/results boundary correction also passed fifteen loading/journey flows.
The final production build transfers 99,417 initial gzipped bytes against a
100,000-byte limit. Local compiled-production tests are not live deployment tests.

## Publication and deployment

Phases 1–5 passed their exact-commit CI before the next began:

| Phase | Commit | CI run |
| --- | --- | --- |
| 1 | 0add1fa | [40449251355](https://github.com/cisohabitat/RunSet/actions/runs/40449251355) |
| 2 | b7552a9 | [40450397253](https://github.com/cisohabitat/RunSet/actions/runs/40450397253) |
| 3 | a805467 | [40451414979](https://github.com/cisohabitat/RunSet/actions/runs/40451414979) |
| 4 | e4d97db | [40452438344](https://github.com/cisohabitat/RunSet/actions/runs/40452438344) |
| 5 | b7c3d30 | [40453723153](https://github.com/cisohabitat/RunSet/actions/runs/40453723153) |

The final audit commit must pass the same complete gate; inspect its exact SHA
in [GitHub Actions](https://github.com/cisohabitat/RunSet/actions/workflows/ci.yml).
No phase may proceed merely because a Vercel build is ready.

Phases 1–2 were also checked on production (four turn flows and five preview
flows). During the later audit, Vercel reported phases 3–5 QUEUED and the public
site still served phase 2. Build-log inspection returned a team-scope 403, even
with the explicit team ID. Later live success is not claimed from GitHub/local
results; deployment availability and team access remain separate release checks.
No unrelated deployments or account settings were changed.

Physical iPhone/iPad sessions, older-player studies and native Mandarin listening
remain paused. Multiplayer remains deferred. This audit does not claim full WCAG
certification or human acceptance of an AAA game.
