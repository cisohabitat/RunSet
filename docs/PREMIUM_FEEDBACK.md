# Premium phase 4: clear, restrained feedback

Actual `lastPlaced` tile IDs now get a static frame and corner dot, with a
translated accessible description and table legend. Hints/practice suggestions
keep their own outline, with one brief pulse instead of an endless glow. The
selection check takes priority over the dot, and joker labels remain clear.

Visible tiles that move between rack and melds get a short destination landing.
Other tiles do not all flash when a move is made. State updates immediately;
animations do not delay reducers or saves. Reduced-motion mode skips JavaScript
landings and keeps the static marks. Resize/unmount cancels owned animation
objects. Round confetti remains a single short celebration and is hidden with
reduced motion; the result heading and score explanation remain available.

Sound selection clicks are quieter, with soft attacks/decays. Placement, draw,
turn and result cues follow actual reducer transitions. Rejected moves do not
play a placement cue; view changes, settings changes and reopening results do
not replay game sounds. Audio is primed from pointer/key gestures and respects
the existing sound preference. Suspended/hidden contexts do not queue old cues.
Practice uses the same preference and transition logic. Read-aloud playback
remains separately requested by the player.

Pure transition tests cover accepted/rejected edits, Undo, draw/pass, incoming
turns, real winners and unchanged/copied states. Browser checks cover English
and Chinese, both motion preferences, static latest-play IDs, single-tile
landings and audio gesture/mute wiring. Audio adapter tests do not prove actual
speaker output or subjective sound quality. Physical-device/listener checks
remain paused.

Local verification: 102 unit tests, 40 focused browser flows and ten offline
flows pass. The final motion/audio checks pass with both languages and motion
preferences. Typecheck/build pass; initial HTML/CSS/JS total 97,411 bytes gzipped
(100,000-byte budget). The full browser suite now contains 162 flows; exact-commit
GitHub CI gates Phase 5. Latest-play screenshots were visually inspected.
