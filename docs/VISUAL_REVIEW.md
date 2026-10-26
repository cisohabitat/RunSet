# Visual review — 2026-10-26

Captured home, setup, rules, practice, game, hint, placed tiles, menu and results
in a 375×667 phone, 820×1180 iPad and 1440×900 desktop viewport, plus a dark phone.
Reviewed screenshots and interaction geometry against the previous production build.

Changes:

- Put Place hint and Dismiss before the optional explanation. Why this works
  expands on demand, keeping the next action visible on a short phone screen.
- Keep lesson navigation outside the scrolling instruction copy. Shorten each
  instruction while retaining the rule and exact action; keep free Reset and
  the invalid-turn penalty explicit.
- Increase small game-control labels and strengthen muted text and tile colours
  in both themes. Automated checks require tile text contrast of at least 4.5:1.
  Disabled primary buttons retain a readable label on a subdued surface.
- Give New group or run a readable label and distinct surface. Allow enough
  context space on wider screens to show table tools with the hint card.
- Replace unsupported diagonal-arrow glyphs with supported right arrows and fix
  the spacing in Game Menu.
- Group backup tools in a card, with explanatory copy expanded on demand. Make
  Delete visually distinct in the menu.
- Show the winner first in results and distinguish the winner's score card.

Browser checks hit-test lesson controls and hint placement before clicking,
check the full first instruction and wide-screen table tools for clipping, and
verify light/dark tile contrast. Existing tutorial, save, layout and offline
checks remain in place. This is Chromium viewport coverage; physical Safari
and assistive technology checks remain manual.
