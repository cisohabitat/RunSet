# Easier independent play

Publish each implementation phase to main. Wait for the exact commit's complete
CI before starting the next. Keep both languages, existing save protection,
offline assets, tile sizes and default game rules. Multiplayer stays deferred.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Simple home | Published; CI passed | Optional main choices with large buttons; secondary actions under More options. |
| 2. Meld magnifier | Published; exact-commit CI gate | Read-only inspection of any group/run, including incomplete groups, at a readable size. |
| 3. Clear touch feedback | Queued | Inspect selected tiles, see the destination and confirm an actual accepted placement clearly. |
| 4. Caregiver setup guide | Queued | A short English/Chinese walkthrough of language, reading size, contrast, sound and pace. |
| 5. Human validation | Paused | Physical iPhone/iPad sessions, older Mandarin-speaking players and native listening review. |

Simple home is runset.simpleHome, a separate optional preference. It neither
changes game defaults nor replaces a saved game. Continue/results stay first;
New game still uses normal setup and replacement confirmation. Learning stays
available without opening secondary options. Delete, practice and backup tools
remain reachable in More options. Deletion preserves the preference.

Full home retains its existing layout. Save/resume context is shared between
both views. The optional view and CSS load separately and are precached. Separate
boolean preference hooks retain existing defaults and sound's safe storage-error
fallback. A failed preference write never prevents play.

Phase 1 local checks: strict TypeScript, 124 unit tests, four new Chromium
journeys, eight existing reading/settings flows and all 18 new production
WebKit/Firefox flows passed. First-use SimpleHome/Settings and secondary tools
worked after disconnecting. Light/dark screenshots were inspected. Larger
comfortable-mode selectors initially overrode the 60 px targets; the styles
were fixed without weakening the geometry checks. Initial HTML/CSS/JS totals
99,981 gzipped bytes under the unchanged 100,000-byte budget.

The complete gate now contains 271 Chromium cases, 147 production compatibility
cases, 19 offline cases and the planner benchmark. Physical-device, older-player
and native Mandarin acceptance remain unverified and paused.

Phase 1 live checks found Settings focus could return to the wrong element on
phone WebKit. The dialog now retains the actual header opener even when a touch
click did not focus it. A deterministic regression opens it with focus elsewhere.
A failed SimpleHome download also offers full Home on Return Home, preserving
saves and other preferences; unrelated Settings failures keep the view choice.
The follow-up adds both recovery regressions and keeps the 100 kB size limit.

The follow-up passed six Chromium journeys, all 24 production WebKit/Firefox
cases and all 124 unit tests. The build/type check passed at 99,986 initial
gzipped bytes. The exact follow-up CI must pass before Phase 2 begins.

The initial CI was superseded while dependency installation used an indirect
APT mirror list still pointing at Azure HTTP. The HTTPS rewrite now covers both
runner mirror-list files as well as direct sources. All browser installs,
signed verification, retry bounds and complete checks are retained.
Phone WebKit also required a guarded next-frame focus retry after native-dialog
inertness clears. The retry runs only with body focus and no new dialog. A held
SimpleHome download exercises closing Settings before the next view finishes.
All nine affected production-browser checks passed; the build remains 99,986
initial gzipped bytes. Live confirmation and exact-commit CI remain release gates.

Phase 1 final f5fb445 passed full CI 40480099367 before Phase 2 began. All 24
live Simple-view/recovery/offline flows passed on that release. The package
mirror fix cleared setup and retained the twenty-minute complete gate.

Phase 2 puts Zoom beside each regular-play destination without another footer
row. Inspection is read-only and available on the human turn. It explains valid
and unfinished groups through the existing rules helper, including joker values.
Its 64×88 tiles do not change main-board density or saved preferences. Timed
expiry still applies and closes the old turn's inspection when the turn changes.

Phase 2 local checks passed strict TypeScript, 124 unit tests, both bilingual
magnifier journeys, 23 existing phone/iPad density checks and all six production
WebKit/Firefox cases. Thirteen-tile runs remain scrollable with a reachable close
control; joker values, current selections/drafts, Undo and timed expiry are
checked through actual UI actions. Screenshots were inspected in both themes.

The footer initially widened some cards; intrinsic-width containment and bounded
padding restored every original row-count assertion. No tile size or geometry
check was weakened. The initial bundle is 99,995 gzipped bytes under the unchanged
100,000-byte limit. The complete gate has 273 Chromium, 153 compatibility and
19 offline cases plus planner benchmark smoke.
