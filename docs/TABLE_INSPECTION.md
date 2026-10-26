# More room to inspect the meld table

In a regular game choose **Expand table → Hide rack**. Chinese labels are
**展开牌桌 → 收起手牌**. The rack disappears and the table takes its space;
**Show rack / 显示手牌** remains at the top. Turn actions, selection count, save
status and an active timer remain available. Tile sizes and touch targets stay
the same.

This is a temporary view choice. Selection, edits, deadline and the saved game
are preserved when the rack is hidden or shown. You can place selected rack tiles
onto the table, select/rearrange table tiles, use hints, Undo or Reset while it is
hidden. Show it again to choose more tiles from your rack. The rack reappears
when the turn changes, you leave Expanded table, or you reload. Only the existing
expanded-table preference persists; no new save/preference schema is introduced.
Practice keeps its rack visible and does not offer this control.

## Measured space

A populated six-meld position with 13 rack tiles, a match and a 120-second timer
was measured in Chinese Chromium touch viewports. These compare Expanded table
with its rack visible versus the new temporary hidden-rack view:

| Viewport/mode | Rack visible | Rack hidden | Extra visible table height |
| --- | ---: | ---: | ---: |
| 375×667 standard phone | 415 px | 497 px | 82 px |
| 375×667 comfortable phone | 333 px | 454 px | 121 px |
| 390×844 standard phone | 592 px | 674 px | 82 px |
| 820×1180 standard tablet | 883 px | 988 px | 105 px |
| 820×1180 comfortable tablet | 831 px | 959 px | 128 px |
| 1180×820 standard tablet | 586 px | 676 px | 90 px |
| 1180×820 comfortable tablet | 471 px | 599 px | 128 px |
| 844×390 comfortable landscape | 152 px | 266 px | 114 px |

The phone toolbar shows a concise countdown (for example `120秒` or `120s`)
while retaining its accessible Time left this turn label. This leaves room for
Hide/Show without an extra toolbar row in typical phone layouts. Save failures
retain their text. Compact table/Escape restores the usual game information.
A native penalty dialog consumes its own Escape first; it does not exit the view.

## Verification

Twenty-six new browser flows cover English/Chinese, standard/comfortable reading,
360×640, 375×667, 390×844, 820×1180, 1180×820 and 844×390; measurable table gains;
real placement/Undo and actionable hints with the rack hidden; selection/save
preservation; automatic return after drawing, leaving the view and reloading;
penalty-dialog Escape; and practice isolation. Controls are hit-tested, with
bounds checked against the viewport and table/dock. Light/dark screenshots were
inspected. At least 60 px of extra visible table is required in each tested case.

The 131-flow browser suite, 92 unit tests, strict type checking, production build
and initial bundle budget pass. The ten-flow production offline suite now checks
first-use hiding, restoration on view exit and visible-rack reload after hiding.

These are Chromium viewport/touch checks, not physical iPhone/iPad Safari tests.
The paused device/older-player study remains unverified. Browser address bars,
notches and physical finger/trackpad behavior require actual-device checks.
