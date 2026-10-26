# Denser standard tiles on iPhone-sized screens

Standard phone play now uses **44×54 px tiles** instead of 44×60 px, with the
same 25 px numbers. The 44 px tap width is retained. Short phone landscape views
also use this size instead of the previous tablet-like 52×70 px tiles.

Tile and meld spacing is tighter, and rack gaps drop from 7 to 4 px. Meld card
side padding is reduced without shrinking the 44 px destination controls. A
smaller corner check mark leaves two-digit numbers clear; selection still has
its raised state, strong outline and check mark. Colour shape marks remain.
Rack padding keeps the entire raised selection outline inside the scroll area.

## Measured benefit

The same conserved six-meld, 13-rack-tile position was measured before/after in
Chinese Chromium touch viewports, with a match, timer and coaching enabled:

| Viewport | Standard tile before → after | Full rack tiles before → after | Six short melds: rows before → after |
| --- | --- | --- | --- |
| 360×640 | 44×60 → 44×54 | 6 → 6 | 6 → 3 |
| 375×667 | 44×60 → 44×54 | 6 → 6 | 3 → 3 |
| 390×844 | 44×60 → 44×54 | 6 → 7 | 3 → 3 |
| 430×932 | 44×60 → 44×54 | 7 → 8 | 3 → 3 |
| 844×390 landscape | 52×70 → 44×54 | 12 → 13 | 2 → 2 |

These measurements describe this fixture, not every possible saved table. More
rack tiles fit and melds occupy less space even where the number of rows stays
the same. On the smallest screens the normal board retains its 180 px floor;
Expand table still gives more visible space with rack/actions on screen.

## Scope and preferences

Apply only to standard regular-game touch views: up to 720 px wide, or short
landscape views below 960 px wide and up to 520 px high. Larger touch controls
retains 54×74 px phone tiles; Comfortable reading retains 58×80 px. Neither
preference is overwritten. iPad landscape keeps its separate 44×60 standard
size. Practice, rules, desktop layouts and game state are unchanged.

## Verification

Twelve new browser flows cover both languages at all five sizes, light/dark,
25 px numbers, row/rack capacity, touch hit targets, real placement and Undo,
rotation with selection/save preservation, a selected two-digit number and joker,
and 50-tile racks while switching larger display preferences. All 105 browser
flows, 92 unit tests, strict type checking, production build/bundle budget and
ten offline flows pass. Screenshots were inspected in light/dark.

These are Chromium touch/viewport checks. Physical iPhone Safari, actual touch
scrolling and older-player readability checks remain unverified/paused.
