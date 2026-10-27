# Easier independent play

Publish each implementation phase to main. Wait for the exact commit's complete
CI before starting the next. Keep both languages, existing save protection,
offline assets, tile sizes and default game rules. Multiplayer stays deferred.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Simple home | Published; exact-commit CI gate | Optional main choices with large buttons; secondary actions under More options. |
| 2. Meld magnifier | Queued | Read-only inspection of any group/run, including incomplete groups, at a readable size. |
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
