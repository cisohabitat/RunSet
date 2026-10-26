# Phase 2: comfortable reading

Phase 1 (human playtesting and physical-device checks) is paused by the user.
This phase implements the shared English/Simplified Chinese reading mode.

## Player-visible changes

- Settings is available from every screen and directly from the game menu.
  Reading/display, sound/pace, and learning help are grouped in one dialog.
- Comfortable reading enlarges main copy to 18 px, supporting labels to 16 px,
  tiles to 58×80 px, and main controls to at least 48 px tall. Decorative small
  art labels are hidden. Headers wrap; full pages scroll instead of squeezing
  enlarged text into the compact game's fixed viewport.
- Tables and racks retain their own scrolling. Expanded racks are still available.
  Both compact and comfortable layouts preserve current selections and progress.
- Selected tiles show a check mark, an outline and raised position. Shape/number
  marks and screen-reader pressed states remain available.
- Invalid-meld headings use a translated DOM label, including 需要调整 in Chinese.
- Done/Escape close settings and restore keyboard focus to the opener. The dialog
  bounds its height and scrolls on small screens. Bot work pauses while settings
  is open; an existing turn timer continues, with a visible reminder.
- Language, reading, tile-only size, sound, pacing and learning choices stay on the
  device. Deleting a game does not delete these preferences.

`runset.reading` is independent of the existing `runset.largeTiles` preference.
Turning comfortable reading off returns to the saved tile-only setting. No game
or practice save schema changes and no engine/rule changes were needed. Settings
and results are separate lazy-loaded chunks, both precached offline; the initial
HTML and referenced CSS/JS remain below the 100,000-byte gzip budget.

## Evidence

- 76 unit tests, strict type checking and the production build pass.
- 47 Chromium flows pass. Eight new reading flows complete basics, joker reuse
  and rearranging in English and Chinese at 360×640, 820×1180 and 1180×757. They
  check fonts/tile size, selection check marks, actual click targets, page overflow,
  preserving selection and saves across view changes, persisted preferences,
  deletion isolation, dialog focus, and a live timer during settings.
- Light/dark screenshots were inspected at the tested sizes. Existing compact
  layout, contrast, hints, game/save and bilingual regressions still pass.
- Five production offline flows pass, including first settings use after
  disconnecting, persisted reading mode after reload, and offline lessons.

These are automated Chromium viewport checks, not physical iPhone/iPad Safari,
VoiceOver or a claim of completed testing with older Chinese speakers. Those
Phase 1 activities remain paused. Further roadmap phases are recorded separately
in ROADMAP.md and are not claimed as shipped by this release.
