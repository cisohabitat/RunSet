# Board and play refinement

Approved 2026-10-28. Publish each phase to main and require the complete exact-
commit CI workflow, including every browser suite and aggregate check, before
starting the next. Continue using Git integration for Vercel; no direct deploy.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Tile-sized draft cards and tighter board gaps | Implemented; local browser/build gate passed |
| 2 | Distinct, calmer selection/destination/invalid/latest states | Pending |
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
