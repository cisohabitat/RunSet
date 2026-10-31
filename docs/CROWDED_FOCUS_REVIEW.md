# Crowded-board visual review

Phase 4 of the [decision-clarity cycle](DECISION_CLARITY_ROADMAP.md).
Baseline `1a0515bde1a90e259e448b8bd103d9df8a396c6e` passed complete CI
[41101619354](https://github.com/cisohabitat/RunSet/actions/runs/41101619354)
(225 unit / 883 browser tests), matching READY production and all 48 live checks
in [41105155839](https://github.com/cisohabitat/RunSet/actions/runs/41105155839).

## Demonstrated issue

Fresh native pointer screenshots covered English/light/standard and Chinese/
dark/comfortable reading at 375×667, 1180×820 and 1440×900. The crowded fixture
contains 50 table tiles in 15 valid melds, 50 rack tiles, six opponent tiles,
all 106 physical IDs and 100 valid Undo snapshots.

Table overview already focuses and outlines the located tile. The phone review
showed the lower part of that outline cut off by the scrolling table. Existing
checks measured the tile rectangle alone; a complete tile did not establish a
complete focus ring. The two-pixel ring was drawn one pixel outside the tile,
so it required three additional pixels on every side.

A stricter regression failed in both languages before the fix: English on the
located first tile of group 15, Chinese on the selected first rack tile after
wrapping keyboard navigation. A raised selected tile can sit very close to the
rack's clipping edge even when its complete physical rectangle remains visible.

## Change and visual scope

Draw the existing focus, selection and rejected-move outlines with a -3 px
inset offset. The focus stroke remains two pixels; selection/rejection widths
and colours also remain unchanged. Their full paint stays inside the tile
rectangle; both the table edge and raised rack edge show the complete frames. The existing theme focus colours are retained.
Selection checks, raised selection position, accepted-play dots, rejected-move
feedback and destination dashes retain their separate meanings.

This changes paint only. Tile bodies, numbers, touch targets, card spacing,
viewport layout, table floors and rack capacities are unchanged. No toolbar,
board row, persistent preference, timer, engine rule, planner or save field is
added or changed. Practice keeps its existing tile dimensions and navigation.

## Regression and review

The existing bilingual crowded-navigation journey now measures visible focus
paint as well as the entire tile and centre hit. It intersects the viewport
with the scrolling region's precise padding-box bounds, accounting for borders
and native scrollbars. Integer client dimensions alone round fractional CSS
sizes, so they are not substituted for the actual fractional rectangle. The
outward extent is max(0, outline width + outline offset); the test also requires
a visible outline at least two pixels wide. There is no epsilon tolerance.

Each profile reviews its native viewport plus landscape tablet and 1440 px
widths, avoiding duplicate sizes. Desktop-sized actions use actual mouse clicks;
phone/tablet actions keep native touch, and Firefox remains mouse-led. Table
overview finds group 15 without selecting or moving tiles. Tile width/height,
table height and exact saved bytes must remain identical before and after.
Size preservation uses exact computed dimensions, which stay independent of
scroll position; Firefox rectangle subtraction reported 450.9999695 versus
451.0000057 for the same 451 px CSS height. Full paint containment still uses
unrounded rectangles. No geometry tolerance is introduced.
The original profile is restored before the existing full crowded journey.

The journey retains every earlier assertion: wrapping Home/End/Left/Right
navigation, selected-tile finder revealing the hidden rack, table-only 300/450 px
floors, source numbers, actual placement into group 15, authoritative reducer
comparison, the 100-snapshot cap, latest-edit versus accepted-play distinction,
Undo, offline reload, all 106 IDs, exact deadline, accessibility and logical
expiry. It additionally checks the selected tile's check mark and its removal
on deselection. A before-failing unfocused selection probe measured a 3 px
stroke at offset 2 px with only 1 px top clearance; its full frame is now inside
the tile. The journey also rejects a real public-tile return to the rack, finds
that tile, checks the unfocused dashed frame, and confirms that clearing
selection restores its surviving accepted-play dot without another save. No
test case, timeout or CI budget is removed or increased.

The same existing cases are now included in production release review. Expected
counts remain 225 units and 883 browser tests; live acceptance expands from 48
to 56 (fourteen cases per profile). Every original live case remains. Complete
exact-commit twelve-job CI and matching READY production/live acceptance are
required before this phase is reported released.

## Local acceptance

The final build passed type checking and the initial gzip budget at 99,418 bytes
(100,000-byte limit), with 77 offline cache files. The complete updated crowded
journey passed in both languages after the focused, unfocused selected and
rejected-move regressions were added. Eight earlier extended-session, meld-space
and arrangement checks also passed during this review. Final complete local
release reviews passed all 14 journeys in Firefox (2.2 minutes) and all 14 in
Chromium (1.7 minutes), run sequentially against the final build. These local
checks do not substitute for the published exact-commit CI and live gate.

These are constructed crowded positions and browser viewports. They do not
establish physical iPhone/iPad usability, mobile suspension, human older-player
acceptance or native Mandarin listening. Those studies remain paused;
multiplayer remains deferred.
