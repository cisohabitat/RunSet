# Enlargement and keyboard review

Phase 2 of the [reliability/accessibility cycle](RELIABILITY_ACCESSIBILITY_ROADMAP.md).
Baseline `366f6cdbceecadc8b2e8b08fbcadeee12df6d383` passed all twelve jobs in
[41159506733](https://github.com/cisohabitat/RunSet/actions/runs/41159506733),
matching READY production and all 64 hosted cases in
[41160974451](https://github.com/cisohabitat/RunSet/actions/runs/41160974451).

## Reproduced findings and changes

- At native Chromium 200% zoom, English setup's focused summary ended at
  406.2890625 px in a 406 px CSS viewport; Chinese Home's New game ended at
  406.484375 px. Page/Home controls now have 12 px block scroll clearance.
- Entering a short game focused a rack tile below the visible page (494.5–554.5 px
  at 640×406). Route focus now schedules an owned reveal after route scrolling,
  checks connection, enabled state, current focus and dialog ownership, and
  cancels on route cleanup. It never refocuses on locale, timer or selection
  updates. Existing lesson-heading and continuation behavior remains.
- Compact header controls had only 5.5 px top clearance for a 6 px outward
  outline. Header focus rings now use a -3 px inset, preserving stroke width.
- At desktop widths above 1180 px, centering a 50-tile rack placed the first tile
  at x=-756.5 with scrollLeft=0. Those negative overflow tiles were unreachable.
  `safe center` retains centering when the rack fits and starts overflowing racks
  at their reachable edge. This is a desktop overflow defect, independent of
  minimum-font settings.
- Chromium's 24 px minimum font enlarged decorative colour glyphs until they
  covered numbers. The same diamond/circle/triangle/star marks now use vector
  shapes with existing geometric size values; the latest-play dot is also a
  fixed geometric circle. Colours, selected check marks, translated accessible
  tile names, pressed state and latest-play descriptions retain their meanings.
- Minimum fonts also clipped the fixed-width Standard-view selector's label.
  The regular workspace now permits its native intrinsic minimum width; compact
  Full screen sizing is unchanged. A temporary native select probe verifies all
  option text has enough width without changing selection or saved state.
- Firefox native Tab scrolling could leave a focused control below the viewport
  despite its margin. After Tab key-up, App explicitly reveals the focused
  control with nearest scrolling. It changes neither focus nor game state and
  adds no pointer/Space/Enter interception.

No tile dimensions, touch targets, table floors, rules, bot budgets, timer
behavior or save schema changes. Vector markers inherit existing colours.
Shared markers have explicit pixel-size variables, so minimum-font settings
increase text without enlarging decorative graphics over the numbers.

## Evidence and journeys

Two Chromium cases use the actual browser APIs in isolated temporary profiles.
Each language checks native `chrome.tabs.setZoom(..., 2)` and independently
checks `chrome.fontSettings.setMinimumFontSize({pixelSize:24})`. The zoom API
reports 2 and the 1280 px window yields a 640×406 CSS viewport with DPR 2.
The minimum-font API reports 24 and the local Home sample text grows from 14 to 33 px
measured height at DPR 1. CSS coordinates can shrink at a responsive breakpoint
while physical size grows under native zoom; the reports retain both values.

The test-only extension is created under an owned temporary directory, uses
tabs/fontSettings permissions only in that isolated browser, and is removed
with its profiles. It is never an app asset, production extension or change to
the user's browser. Explicit bundled Chromium selection avoids local branded
Chrome's extension restrictions. No timeout was increased to conceal that
initial harness configuration error.

Production cases separately exercise 640×406 and 320×640 CSS viewport reflow in
Chromium, Firefox and both WebKit profiles. These are not claimed as native zoom
in Firefox/WebKit. Each scenario owns a fresh context, confirms offline readiness,
disconnects, reloads and first-visits Settings, setup and rules offline.

Every journey uses real Tab/Shift+Tab, Enter, Escape, Space and tile arrows/Home:
skip link and main focus; Settings Done/Escape/opener return; setup without
replacement; rules disclosure; preserved tile selection across reading changes;
an actual draft placement and reducer-checked Undo with the 100-snapshot cap.
Read-only steps preserve exact saved bytes. Check translated tile names, selected
state, native targets and complete focus paint, centre hits, horizontal bounds,
corner symbol size/position and Game Axe violations. Checkbox targets use their
associated large labels; their focused 24 px glyphs still require complete paint.

The keyboard helper navigates toward earlier controls using Shift+Tab. Firefox
headless does not cycle its last document control back through browser chrome
with page-only keyboard injection; that initial test path was not an app focus
trap. Symbol bounds protect the numeric centre; inline font line boxes are not
used as a proxy for painted numeral bounds. Screenshots supplement these checks.

Expected counts: 225 units and 897 browser cases (349 main; 146 per compatibility
profile; 70 offline; 40 historical upgrades). All previous cases remain. Hosted
review adds eight cases to the previous 64: 72 total, eighteen per profile.
The complete exact-commit twelve-job CI and matching READY production/hosted gate
are required before this phase is reported verified.

Physical iPhone/iPad Safari, OS Dynamic Type, human screen-reader usability,
older-player acceptance and native Mandarin listening remain unverified/paused.
Axe and accessible-name checks do not establish full WCAG conformance or how
VoiceOver/TalkBack actually sound. Multiplayer remains deferred.

## Local acceptance

The broader regression run passed 33 main cases and four cases in each of the
four production browser profiles. After the final selector-width adjustment,
the two native cases and two reflow cases per profile passed again. A separate
built-bundle run also passed both native cases (four zoom/font journeys), using
`npx playwright test --config=playwright.enlargement.config.ts`. CI runs the native
cases against the development server; this supplemental config tests built
assets without adding duplicate cases to the release counts.

The final build passed type checking and measured 99,158 initial gzip bytes,
under the unchanged 100,000-byte limit, with 80 precached files. Four final
responsiveness cases recorded 40 samples under 4× CPU throttling, with a maximum
of 456.8 ms against the existing 1,000 ms smoke bound. These local development
measurements are not a controlled before/after comparison or physical-device
latency claim. [Raw measurements and source fingerprints](ENLARGEMENT_SAMPLES.json)
retain the native API values, reflow scopes, asset sizes and individual samples.
