# Easier independent play

Publish each implementation phase to main. Wait for the exact commit's complete
CI before starting the next. Keep both languages, existing save protection,
offline assets, tile sizes and default game rules. Multiplayer stays deferred.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Simple home | Published; CI passed | Optional main choices with large buttons; secondary actions under More options. |
| 2. Meld magnifier | Published; CI passed | Read-only inspection of any group/run, including incomplete groups, at a readable size. |
| 3. Clear touch feedback | Published; CI passed | Inspect selected tiles, see the destination and confirm an actual accepted placement clearly. |
| 4. Caregiver setup guide | Final release; exact-commit CI gate | A short English/Chinese walkthrough of language, reading size, contrast, sound and pace. |
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

Phase 2 f7d4419 passed full CI 40484343132 before Phase 3 began. Its Vercel build
remained queued at that gate; no live acceptance is claimed for that queued build.
Detailed deployment status was unavailable to the connection (403); basic listing
and public-site checks remain available. Do not bypass the scoped API denial.

Phase 3 replaces the selected-count text with an optional read-only tile preview.
It does not judge mixed selections as complete melds. Accepted relocation is
confirmed from actual before/after tile locations, with a brief footer mark and
screen-reader announcement. Opening progress, error text and board space remain.
Rejected regular moves restore the selection; practice keeps its teaching flow.

Phase 2 subsequently became READY on Vercel; all six exact-release live
magnifier/offline flows passed before Phase 3 publication. Phase 3 adds four
observed-placement unit cases and count/destination translation coverage. A
synchronized remote edit clears stale marks; rejected moves keep selection.
Four earlier CSS declarations identical to later declarations in the same
selector/media context were removed to retain the unchanged initial size limit.

Phase 3 local verification passed 129 unit tests, bilingual touch and magnifier
journeys, all 23 phone/iPad density cases and production WebKit/Firefox coverage.
The selected preview also works on its first offline visit in the shared
magnifier journeys. A synchronized remote edit clears feedback before the next
move. Rejected moves retain selection and show the engine's own explanation.

Final source checks passed the targeted smallest-device geometry cases and all
six touch-feedback compatibility flows. Screenshots were inspected in both
languages/themes. Four provably overridden identical CSS declarations were
removed; initial HTML/CSS/JS remains 99,985 gzipped bytes under 100,000. Full CI
now has 275 Chromium, 159 compatibility and 19 offline cases plus the benchmark.

Phase 3 CI 40490688332 caught comfortable-phone toolbar overflow and lost table
height. The follow-up uses concise count/Clear labels and bounded toolbar
padding while preserving font sizes, >=48 px controls and the strict >=300 px
expanded-phone table requirement. The failed CI is not an acceptance gate.

The correction passed all 26 reading/board-space/touch flows, all 12 production
WebKit/Firefox magnifier/touch flows and all 129 unit tests. The build passes at
99,986 initial gzipped bytes. Exact-commit CI remains the next phase gate.

Additional production WebKit checks found that native font metrics consumed
another five pixels on a comfortable Chinese phone. Expanded-rack padding is
now bounded without changing tiles. Two new permanent compatibility cases
check >=300 px table space, >=48 px controls, viewport bounds and save/selection
preservation in both languages across WebKit and Firefox (165 total cases).

Phase 3 final b8508e0 passed full CI 40495430960: 129 unit, 275 Chromium,
165 production compatibility and 19 offline cases, plus planner benchmark smoke.
All 12 exact-release live touch/comfortable-phone cases passed before Phase 4.
The unchanged initial budget passes at 99,986 gzipped bytes.

Phase 4 adds an optional Set up together checklist inside Settings. Its five
steps cover language, reading/contrast/Simple home, sound, pace and learning
together with the default Easy untimed setup. The language control is shared
with the header and mounted only while the guide is open. Choose display
settings closes the checklist and focuses the existing reading control. No
presets are applied and no game is started or replaced. Timers keep running.

Phase 4 local checks passed the six bilingual production-browser offline flows,
14 existing reading/Settings/Simple-home journeys and the Chromium dictionary
failure regression. Download errors now remain readable inside the modal. The
build passes at 99,987 initial gzipped bytes. The final gate has 129 unit,
276 Chromium, 171 production compatibility and 19 offline cases plus benchmark.
See [release evidence](INDEPENDENT_PLAY_RELEASE.md) for accepted phase CI and
verification limits. The final exact-commit CI must pass before acceptance.
