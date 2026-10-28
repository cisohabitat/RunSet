# Board and play refinement

Approved 2026-10-28. Publish each phase to main and require the complete exact-
commit CI workflow, including every browser suite and aggregate check, before
starting the next. Continue using Git integration for Vercel; no direct deploy.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Tile-sized draft cards and tighter board gaps | Published; full CI and six live journeys passed |
| 2 | Distinct, calmer selection/destination/invalid/latest states | Published; full corrected CI and six live journeys passed |
| 3 | Evidence-based opening and endgame bot decisions | Implemented; audit and verification in progress |
| 4 | Clearer, brief placement/rejection/ending feedback | Pending |

Physical older-player/device study remains paused. Automated WebKit is not
physical iOS. Native Mandarin quality and battery use remain unverified.
Multiplayer stays deferred.

## Phase 1

The footer was already constrained to tile width; the remaining source of wide
drafts was the full explanation paragraph. Wrap that explanation within the
card without removing it. Keep a three-tile-sized minimum footprint for standard
cards and larger minimums for explicit large/comfortable preferences. Reduce
regular desktop row gaps, keeping the existing tighter coarse-pointer overrides.
No masonry/dense reordering, game mutation, storage key, smaller tile or new
permanent control row is introduced. IDs/source numbers and keyboard order stay
stable. The new optional GameLayout stylesheet loads with gameplay and is cached
offline.

An initial 375 px Chromium mouse baseline reproduced wide unfinished cards
(about 282 px English / 225 px Chinese) that could not share the first row.
Coarse-phone regression coverage checks two standard cards on a row while
preserving >=44 px tiles/targets. It includes a thirteen-tile run, rotation,
real placement to original meld 8, Undo, exact-save comparisons, comfortable
58x80 tiles, both languages/themes and first-use offline loading. A test initially
assumed CSS min() serialized to pixels; it now checks the actual physical width.

Phase 1 local browser gate: 24 journeys passed (4 Chromium, 18 compatibility,
2 offline), including the existing strict comfortable-board/magnifier checks.
Reviewed English-light and Chinese-dark phone/tablet screenshots. Type/build
passed; initial HTML plus referenced assets total 99,246 gzip bytes under the
unchanged 100,000-byte budget, with 70 precached files. Full exact-main CI is
required after publication before Phase 2.

All 186 unit tests passed before Phase 1 publication.

Phase 1 accepted main: 9160088, complete CI
[40671169930](https://github.com/cisohabitat/RunSet/actions/runs/40671169930)
passed with 186 unit and 632 browser tests (304 Chromium, 93 per compatibility
project, 49 offline), plus aggregate check. Matching READY production passed six
live bilingual layout journeys before Phase 2 started.

## Phase 2

Safe destinations use a dashed inset outline. Keyboard focus keeps the distinct
solid focus-colour ring; selected tiles keep their check mark, raised position
and solid outline. Remove the selected tile's extra block shadow and the recent
tile's inset border; latest-play dots and accessible explanations remain. Invalid
cards retain their text/colour cue, use the theme's error border and slightly
larger repair text. Comfortable repair copy remains 18 px. No new board row,
state inference, timers, speech, storage or animation behavior is added.

The existing meld-space journeys now check actual selected/check-mark state,
latest-play dots/descriptions, safe-destination dashes and keyboard focus as
separate cues, while retaining real placement, Undo, exact-save, long-run,
rotation and offline checks. Existing contrast, touch-feedback and strict
comfortable-board checks remain part of verification.

Phase 2 screenshot polish removes uppercase/tracking from captions without
changing text or font size; this reduces unnecessary English wrapping. The
comfortable invalid label is 16 px. During the phase, 37 targeted browser checks
passed; ten final cue/layout journeys passed after caption polish. Type/build
passed at 99,247 initial gzip bytes and 70 precached files. No rules or storage
code changes. Complete exact-main CI remains required before Phase 3.

The final scaled full-screen image appeared to clip Zoom, but the original-size
card close-up and direct DOM range measurements confirmed that the complete
label is visible. Added footer button/card bounds, complete magnifier-text bounds
and small card screenshots as regression guards. No app change was needed for
that concern. The first Phase 2 publication is 5ffa0bf; acceptance uses the final
exact-main commit including these guards, not a superseded workflow.

All ten final footer/text-bound journeys passed across Chromium, compatibility
and offline after adding the guards; gameplay/style files remain unchanged.

Phase 2 gate [40674077693](https://github.com/cisohabitat/RunSet/actions/runs/40674077693)
on 1f03d3e is not accepted. Quality, Chromium, both WebKit jobs and offline passed,
but Firefox English failed the new magnifier text/scroll-bounds check (92 other
Firefox cases passed). Local original-size screenshots did not reproduce those
CI font metrics. The magnifier now uses intrinsic max-content width with a
44 px minimum, retaining the more specific comfortable 60 px rule and full
translated label. Tests also enlarge the label text to 20 px before measuring
complete glyph/scroll bounds; no assertion is removed or relaxed. A new complete
exact-main gate is required before Phase 3.

The font-fit correction passed 18 targeted local journeys (4 Chromium, 12
compatibility, 2 offline), plus the focused Firefox English check with both
native and enlarged text metrics and diagnostic measurements. Type/build
passed at 99,247 initial gzip bytes / 70 precached files.

Phase 2 accepted main: 7703915, complete corrected CI
[40676274036](https://github.com/cisohabitat/RunSet/actions/runs/40676274036)
passed (186 unit, 632 browser, all jobs and aggregate check). Matching READY
production passed all six live bilingual cue/font journeys before Phase 3.

## Phase 3

Two tactical regressions were observed failing before the planner changed.
With red 4,5,7,8, blue/orange 13 and a joker, Normal/Hard chose a three-tile
39-point group over a qualifying five-tile 30-point run. Their opening search
now prefers tile count once both alternatives meet 30; below 30 it still seeks
points. Easy and default/unrelated rackPlan callers retain point-first opening
behavior and existing forgiving choices.

With a blue/orange/black group of 4s before a red 1–3 run and red 4,5 in the
rack, Normal filled the group and missed its rack-empty winning run extension.
A bounded alternate-first-extension rollout keeps the legal greedy baseline and
accepts only a higher tile count, with a 20 ms work slice and the same total
240 ms work cap inside the requested production budget. Hard retains its legal
Normal baseline and additional partition search. No opponent racks, pool order,
future draws or minimax tree is used. Each extension passes the complete turn
validator; Easy, opening threshold and joker rules stay intact.

Four tactical/safety regressions plus existing bot/coaching checks passed (24
focused tests), including zero-budget fallback and hidden-allocation invariance.
Balanced before/after production-budget reviews use deals 201 and 202 with all
six ordered mixed seatings and all six ordered head-to-head pairings per deal.
The tactical fixtures were designed separately; these held-out seeded reviews
check legality and timing, not a statistically reliable win-rate ranking.
Raw reports retain source fingerprints, host, proposals, opening opportunities,
passes, per-round results and limits. Node/Linux timings do not establish
physical Apple performance or human enjoyment.

The completed [bot decision review](BOARD_BOT_REVIEW.md) links all four raw
reports and records unchanged sample win counts, exact tactical improvements,
latency costs and source fingerprints. All 190 unit tests and the production-
budget benchmark smoke passed. Build: 99,246 initial gzip bytes, 70 cache files.

All ten actual-worker browser journeys passed (2 Chromium, 6 compatibility,
2 offline), covering a real five-tile opening and the competing-group/run
rack-empty finish, literal names, actual save completion, unchanged hidden
allocations, accessibility and first-use offline worker loading.
