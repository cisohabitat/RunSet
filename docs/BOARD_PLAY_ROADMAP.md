# Board and play refinement

Approved 2026-10-28. Publish each phase to main and require the complete exact-
commit CI workflow, including every browser suite and aggregate check, before
starting the next. Continue using Git integration for Vercel; no direct deploy.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Tile-sized draft cards and tighter board gaps | Published; full CI and six live journeys passed |
| 2 | Distinct, calmer selection/destination/invalid/latest states | Implemented; local verification in progress |
| 3 | Evidence-based opening and endgame bot decisions | Pending |
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
