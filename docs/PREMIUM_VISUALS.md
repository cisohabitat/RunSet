# Premium phase 3: consistent, readable foundations

`src/theme.css` is the shared source for native fonts, light/dark surfaces,
tile colours, interactive borders, focus rings, spacing, corner radii and panel
shadows. Decorative dividers remain soft; form controls use a stronger border.
Menus share an elevation treatment. Active options and progress use a brighter
accent in dark mode. Native controls follow the selected system colour scheme.

English and Chinese use installed system fonts, including Apple/Windows/CJK
fallbacks, rather than naming web fonts that are never downloaded. Tile numbers
use tabular figures. The established phone/iPad tile dimensions and enlarged
reading/touch choices stay intact. Obsolete rack-toggle styles were removed;
intentional device/reading layout overrides remain separate from theme tokens.

Keyboard focus uses a visible three-pixel outline across buttons, fields,
selectors, links, summaries and tiles. Form-field boundaries and focus rings
are measured against their surroundings at a minimum 3:1 contrast. Existing
tile-text checks retain their 4.5:1 minimum. Short guidance uses “group or run”
instead of assuming the reader understands “meld”. Setup copy also applies to
custom matches, and match labels separate the target from the text.

Twelve new browser scenarios cover English/Chinese, light/dark, touch phone,
touch iPad landscape and mouse desktop. They inspect Home, setup and a populated
game, check keyboard focus/field contrast and horizontal overflow, and capture
screenshots. Eight additional deterministic hint cases cover a ten-tile,
88-point opening on 360/375 px phones in both languages/themes. The phone
toolbar stays on one row; secondary table navigation is available on larger
screens. Hint previews keep their short count above sticky Place/Dismiss
actions, with the complete message and explanations in Why this works.
The full suite now has 157 browser flows.

Local verification: 97 unit tests; 40 visual/device/reading flows; final 28
foundation/play-flow/hint checks; ten offline flows; strict typecheck/build. Initial
HTML/CSS/JS total 97,035 bytes gzipped against the 100,000-byte budget.
Screenshots were visually inspected. Physical-device and older-player checks
remain paused; Chromium viewport results do not certify Safari or human usability.
