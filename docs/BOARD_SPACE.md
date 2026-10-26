# More usable space for melds on phones and tablets

The reported problem was reproduced with a populated, conserved six-meld position,
13 rack tiles, beginner guidance, a match and a timer. In a 375×667 Chromium touch
viewport, the regular board was about 133 px high: the first row's destination
controls were clipped. Expand table did not change that height because the
optional context still consumed the same space. Comfortable reading capped a
portrait iPad-size board at 320 px.

## Changes

- The table toolbar is outside the scrolling optional context. Expand/Compact is
  reachable while hints or guidance are open.
- Expand table now uses the viewport for the board, rack and turn controls.
  Secondary context/header content yields that space. The exit button, save
  status and an active timer remain visible. Sorting is available through More.
- The board still scrolls; hints use a bounded area with sticky action buttons.
  Placement, undo, reset, drawing/passing and penalty confirmation keep the same
  rule validation. No tiles move merely because the view changes.
- The regular board has a 180 px floor on compact phones and a responsive tablet
  floor. Short-laptop hints retain complete tiles/controls and a readable heading.
- Comfortable reading boards scale to the viewport instead of a fixed 320 px.
  Smaller-device practice uses page scrolling with a table of at least 260 px;
  new lesson continuation controls and completion are brought into view.
- Expanded view is remembered as `runset.tableExpanded` across turn remounts and
  reloads. Practice remains separate. Compact table/Escape exits, restores focus
  and releases body scrolling. Native dialogs keep their own Escape behavior.
- Game UI is loaded separately and precached offline. The initial HTML and
  referenced CSS/JS stay below the existing 100,000-byte gzip budget.

## Measurements

These are measurements of the stated fixture and Chromium viewport, not promises
for every position or measurements on physical Apple devices.

| Viewport and mode | Before normal board | New normal board | New expanded board visible |
| --- | ---: | ---: | ---: |
| 375×667 compact phone | 133 px | 180 px | 409 px |
| 375×667 comfortable phone | 320 px | 367 px | 333 px |
| 820×1180 comfortable tablet | 320 px | 649 px | 831 px |
| 1180×820 compact tablet | 220 px | 287 px | 523 px |

In a scrolling comfortable page, a board can be taller in absolute terms than
expanded view. Expanded view instead makes its board space visible together with
the rack and turn controls; in the phone example the normal board began around
600 px down the page. Expanded phone/tablet tests require at least two complete
meld cards visible and no overlap with the player dock.

## Verification

- Strict type checking, the production build and 90 existing unit tests pass.
  Rules, planning and save schemas are unchanged.
- 76 browser flows pass. The 16 new touch-emulated flows cover both languages and
  reading modes at 375×667, 820×1180 and 1180×820; short 844×390 landscape screens;
  real placement after scrolling; hints; current timer/save status; unchanged
  position on a view switch; reload/turn persistence; Escape/focus restoration;
  a native penalty dialog; round completion/body-scroll cleanup; and practice.
- Existing complete-lesson, large-rack, short-laptop, control, hint, save, result,
  contrast and bilingual regressions still pass. Navigation tests await the
  deferred game view before measuring it rather than sampling the loading frame.
- Eight production offline flows pass, including first-use game UI and expanded
  preference after disconnecting, plus settings, lessons, results and replay.
- Before/after screenshots were inspected, including light/dark and large tiles.

Physical iPhone/iPad Safari and the older-player study remain unverified/paused
as recorded in the roadmap. The tests use Chromium touch/viewport emulation.
