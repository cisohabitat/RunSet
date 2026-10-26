# RunSet improvement roadmap

## Current roadmap: older Chinese-speaking players

Phase 1 is paused at the user’s request. Phases 2–4 are implemented;
Phases 5–6 remain planned. Each implementation phase is published separately,
and GitHub CI for its exact commit must pass before the next phase begins.

| Phase | Status | Work |
| --- | --- | --- |
| 1 | Paused | Observe 3–5 older Chinese-speaking beginners; physical iPhone/iPad checks |
| 2 | Implemented | Comfortable reading, larger tiles/controls, selected check marks, unified Settings; see [READING_MODE.md](READING_MODE.md) |
| 3 | Implemented | Dynamic next actions, opening progress, End explanations, safe destination outlines and action definitions; see [FIRST_GAME_GUIDANCE.md](FIRST_GAME_GUIDANCE.md) |
| 4 | Implemented | Ending and tie-break explanations, actual score arithmetic, same-settings replay and editable current options; see [RESULTS_AND_REPLAY.md](RESULTS_AND_REPLAY.md) |
| 5 | Planned | Optional replayable Mandarin lesson/reminder audio with text retained |
| 6 | Planned | Short mistake-focused exercises and a larger difficulty evaluation before tuning bots |

English/Simplified Chinese support is already implemented; multiplayer stays
deferred. The release history and original acceptance criteria follow below.

## Earlier releases

Status: Releases 1–3 and the local expansion (multi-round matches and optional
turn timers) are implemented. Each implementation phase is published separately
to `main`. Automated coverage includes guided learning, isolated saves,
delete/replace, hints, penalty warnings, undo, crowded layouts, matches, timeout
handling, offline reload, and explicit updates. Real-device Safari and the
five-person usability study remain unverified. Online multiplayer is deferred at
the user’s request and excluded from active completion criteria. The historical
proposal is archived in [MULTIPLAYER.md](MULTIPLAYER.md).

## Product goal

A person who has never played tile-rummy should be able to learn, finish a first
turn, and return to their game comfortably on desktop, iPad, or iPhone.

Preserve the existing classic rules, static hosting, local-only saves, and shared
human/bot validator. Improve the experience before adding more game modes.

## Starting baseline (before these phases)

The starting release included five screens, an illustrated rules reference,
responsive CSS, mouse dragging and tap selection, bots, and autosave. It lacked an interactive tutorial, dedicated device layouts, and a delete-game
control; those are now implemented. Chromium viewport checks have passed; real iPhone/iPad Safari testing
has not yet been established.

## Release 1: a welcoming game on every device

These three workstreams are the highest priority and should ship together.

### 1. Teach the goal and the first turn

Replace the assumption of prior knowledge with a clear entry choice:

- **Learn to play** starts a short, guided practice game.
- **New game** starts a regular round.
- **Continue game** appears when an unfinished round exists.

Start with: “Be the first to play all the tiles from your rack. Make groups of
matching numbers in different colours, or runs of consecutive numbers in one
colour.” Define “rack”, “table”, “pool”, and “meld” when first introduced; use
“group or run” in the main instructions instead of unexplained terminology.

The practice sequence uses a fixed deal and teaches one action at a time:

1. Select three matching numbers in different colours and place a group.
2. Select consecutive numbers in one colour and place a run.
3. Make an opening play worth 30 points; show the addition explicitly.
4. End a valid turn and watch a narrated opponent move.
5. Draw when no play is available, explaining that drawing ends the turn.
6. Try a deliberately invalid arrangement, explain why it fails, then reset it.
   Explain the regular game's three-tile penalty without surprising the learner.

Finish with an invitation to play against one Easy opponent. Keep jokers and
table rearranging in optional follow-up lessons so the first lesson stays short.
The rules reference remains available during every regular game.

Acceptance criteria:

- A new visitor can identify the objective and start practice without opening a
  long rules page. Experienced players can skip practice immediately.
- Each instruction describes the next concrete action and highlights its target.
  Instructions adapt to mouse, keyboard, or touch without relying on hover.
- Practice uses the real rules engine with valid scripted states. Demonstrating
  a penalty is separate from applying it in a normal game.
- Practice never replaces a saved regular game. Tutorial progress and completion
  are stored separately, with graceful behavior if storage is unavailable.
- Players can exit, restart, or replay practice. Completion does not hide help.
- In a small first-time-player usability check, at least four of five participants
  complete the opening turn without verbal coaching. Treat this as a release
  target, not a result already achieved.

### 2. Let players delete an existing game

Show a saved-game summary on Home: player name, opponents, difficulty, and whose
turn it is, with **Continue game** and **Delete saved game**. Provide the same
delete action in an in-game menu. Completed saved rounds can also be cleared.

Use a confirmation dialog: “Delete this saved game? Your progress will be lost
on this browser.” Offer **Keep game** and **Delete game**, with initial focus on
the safe choice. Starting a new game while another exists gets a separate
replace-game confirmation instead of silently overwriting progress.

Acceptance criteria:

- Cancel preserves the exact saved and in-memory state, including an unfinished
  turn; confirm removes both and returns to Home.
- Confirmed deletion cancels scheduled bot work and prevents autosave from
  recreating the deleted game. Reloading does not show Continue.
- Only RunSet's game data is removed. Sound settings and learning preferences
  remain intact; never use `localStorage.clear()`.
- If removal fails, show an honest error and do not claim the saved game is gone.
- The dialog supports keyboard navigation, Escape, focus containment, and focus
  restoration. Buttons remain easy to distinguish and activate on touch.
- Automated coverage includes cancel, confirm, reload, deleting during a bot turn,
  replacement of a save, and storage failure.

### 3. Design explicit desktop, iPad, and iPhone views

Use one responsive application and shared game state. Layout responds to usable
space and input capabilities, rather than browser/device-name detection. Allow
manual access to touch-friendly controls on tablets with keyboards or trackpads.

| View    | Layout and interaction                                                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop | Opponents above a broad table; visible rack and action bar; mouse dragging plus click selection; keyboard controls and optional concise shortcuts.                                                                      |
| iPad    | Touch-sized tiles and destinations; a wrapping rack; spacious table in landscape and a stacked layout in portrait; tap selection is fully sufficient. Trackpad dragging remains optional.                               |
| iPhone  | Compact opponent summary; table can scroll independently; a persistent rack and primary actions that respect screen safe areas; clear selection count, Place, and Deselect controls. All actions work without dragging. |

On smaller screens, do not shrink tile targets indefinitely. Prefer controlled
rack scrolling, wrapping, or an expandable rack when many tiles accumulate.
Scrolling a table or rack must not accidentally select or move tiles. Clearly
show when additional table content exists outside the visible area.

Acceptance criteria:

- Complete setup, practice, play, reset, draw, delete, and results on each view.
- Interactive touch targets are at least 44 × 44 CSS px, including small controls.
  Tile colours retain shape cues; selection and invalid states have non-colour cues.
- No unintended horizontal page scrolling. Deliberate rack/table scrolling is
  contained and visibly indicated. Focused tiles and destinations can be brought
  into view without losing selection.
- The table, rack, and primary actions remain reachable with 14, 30, and 50 rack
  tiles, a crowded table, long names, and one to three opponents.
- Rotation, iPad Split View resizing, browser toolbar changes, and opening the
  name keyboard preserve game state and do not obscure the required controls.
- Keyboard play, text enlargement, reduced motion, and both themes still work.

Required verification matrix (CSS pixel sizes are representative test viewports):

| Platform              | Coverage                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Desktop               | 1280 × 800 and 1440 × 900; current Chrome, Firefox, and macOS Safari; keyboard and mouse.                |
| iPad                  | 768 × 1024 and 820 × 1180, portrait and landscape; narrow Split View; actual iPad Safari with touch.     |
| iPhone                | 375 × 667, 390 × 844, and 430 × 932; portrait and landscape; actual iPhone Safari, including safe areas. |
| Small-screen baseline | Retain the existing 360 px width support.                                                                |

Viewport automation is a regression check, not evidence of real-device Safari
compatibility. Record which physical-device checks were completed before release.

## Release 2: help players understand their choices

Build on the learning experience and device layouts from Release 1.

- Add contextual explanations: “This group repeats blue” or “This run is missing
  a 6”, with a suggested correction. Show an opening-point breakdown.
- Add **Show a possible move**, first as an explanation/highlight, then an explicit
  optional placement. Never auto-play a hint or silently change the table.
- Offer optional narrated bot moves: explain the group, run, or extension just
  played. Preserve pacing controls and reduced-motion preferences.
- Add optional lessons for jokers, their represented values, exact replacement,
  and splitting or merging table melds.
- In learning mode, explain the penalty and offer **Keep editing**, **Reset turn**,
  or explicit confirmation before completing an invalid turn. Keep classic
  penalties intact and make the mode's assistance clear.

Acceptance: every explanation and hint agrees with the engine; hints work during
unfinished turns without losing edits; hidden bot racks remain private; hints
and bot planning keep the UI responsive on iPhone and iPad.

## Release 3: make regular play more comfortable

- Undo one move within the current turn, in addition to full Reset turn.
- Improve crowded-table navigation and provide an optional larger-tile view.
- Add restart/rematch controls with explicit saved-game replacement behavior.
- Add installable offline support with an update flow that preserves active games.
- Review Hard-bot planning on real mobile hardware; move search into a worker if
  measurements show input or animation stalls. Retain bounded searches and the
  shared legality validator.

Acceptance: undo cannot reverse a completed turn, reveal future pool tiles, or
break tile conservation; offline/update tests preserve valid saved games.

## Local expansion shipped; online multiplayer deferred

Multi-round matches to 100/200/500 points and optional 60/120-second turn timers
are implemented. Timers remain off by default for learners. Online multiplayer
is outside the current scope; no backend setup or workspace access is required.
Focus remaining validation on Apple devices and first-time-player usability.

## Implementation order and release gates

1. Capture current UI flows and create fixtures for onboarding, saved turns,
   crowded tables, and large racks.
2. Implement safe delete/replace behavior and its persistence regressions.
3. Build the desktop/tablet/phone layouts and reusable accessible dialog controls.
4. Add the guided first game using the responsive controls and isolated practice
   state, then run the first-time-player usability check.
5. Ship Release 1 after its three workstreams pass; proceed to contextual coaching
   and hints, then convenience features.

For each release, run TypeScript checks, engine/persistence tests, bot legality
simulations, and the production build. Add browser regressions for the changed
flows and complete the relevant physical-device checks. Recheck the production
bundle budget of 100 kB gzipped when adding tutorial or offline code; defer-load
optional lessons where useful. Update README with shipped behavior and label
unimplemented work as planned. Use these acceptance criteria to assess readiness
rather than assigning dates before implementation and device testing.
