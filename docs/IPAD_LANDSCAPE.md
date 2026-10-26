# More tiles in iPad landscape

The standard playing view now uses a denser layout on landscape touch viewports
960–1440 px wide and at least 600 px high. This covers representative 1024×768,
1180×820 and 1366×1024 iPad sizes. It responds to available space and a coarse
pointer, including tablets that also have a trackpad, rather than a device name.

## Changes

- Standard tiles are 44×60 px with 26 px numbers, down from 52×70 px on the smaller
  tablets and 49×68 px on the larger view. Tile targets remain at least 44 px.
- Tighter tile/meld gaps and card padding fit the six three-tile melds in the test
  position in one row at all three widths, versus two rows before.
- The site header is 52 px high instead of 68 px; the game heading is 22 px.
- Scores/timer and opponents/guidance share columns above the table. Full current
  guidance stays visible; three opponents and long names remain contained.
- Rack tools and primary turn actions share a row. Hint controls stay reachable
  beside the opponent information. Expanded table keeps its viewport workspace
  and safe-area padding.

Comfortable reading retains 58×80 px tiles and its flowing large-text layout.
The explicit Larger touch controls preference also retains its existing larger
sizes. To use the densest landscape view, leave these two larger-display options
off in Settings. Rotation restores the appropriate portrait layout and preserves
selection, the timer and the exact saved position. Mouse-only desktop, phones,
practice and game rules are unchanged.

## Verification

- Eleven new browser flows cover English/Chinese at all three landscape sizes,
  light/dark screenshots, complete instructions, bounds/hit targets, one-row meld
  density, actual touch placement/Undo in expanded view, rotation with selected
  tiles/save preservation, 50-tile racks and larger display preferences.
- Additional cases cover three long opponent names with a live hint and a
  mouse-only desktop whose previous tile/header sizes remain intact.
- The full 93-flow browser suite, 92 unit tests, strict type checking, production
  build/bundle budget and ten production offline flows pass.

These are Chromium touch/viewport checks. Physical iPad Safari, real safe-area
insets, trackpad hardware and the older-player study remain unverified/paused.
