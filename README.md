# RunSet

Learn to play names the correct action when a step needs a button instead of
tiles. English and Chinese corrections follow the current step and clear old
feedback as the lesson advances, while your regular game stays separate.

Returning to a timed game now explains an expired turn before you continue,
including whether it will draw a tile or pass. Editable saved drafts explain Undo
and Reset, and More’s turn-help controls have larger tap targets and readable text.

Settings keeps its title and Done button visible while the options scroll,
including on narrow phones and in comfortable reading. The fresh
[visual clarity cycle](docs/VISUAL_EASE_ROADMAP.md) records the review and next phases.

Updates read cached files from the active version first, while an open older
tab can still load its previous hashed app chunks. Historical upgrade checks
cover saved drafts, Undo, preferences, all four learning records and older
portable profiles, including interrupted installs and offline recovery. See
[upgrade compatibility](docs/UPGRADE_COMPATIBILITY.md). Run `npm run test:upgrade`
from a full-history checkout to repeat the dedicated browser suite. The live
review also checks active-version manifest content offline in all four browsers.

Muting sound, hiding the page or leaving a screen cancels queued game cues.
Turning sound back on does not replay them. The fresh
[bot and feedback review](docs/REFINEMENT_GAME_FEEL.md) records the difficulty
audit and celebration checks; new games still default to one Easy opponent.

Learn to play clears its wrong-selection tip when you deselect with Escape,
Clear/Deselect all or Reset. The next instruction follows the current lesson
step, and your regular game stays separate.

More → Find and arrange tiles → Tile markings explains selection checks,
latest-play dots, destination dashes and hint highlights. This read-only key
keeps the meld area available and works offline in both languages.

The turn status now prompts you to choose a placement after selecting tiles.
Unfinished turns still show their warning; placement and accepting End turn remain
separate steps. The [older-player refinement cycle](docs/OLDER_PLAYER_REFINEMENT.md)
tracks the four approved phases and their release checks.

Phone headers now reflow on Results and other non-game screens. During play,
very narrow screens use the tile logo as the labelled Home button. Compact turn
controls retain 44 px touch targets, and Game menu has a translated Close menu
button that returns focus to its opener. See the
[release consolidation review](docs/RELEASE_CONSOLIDATION.md) for the connected
bilingual journey, browser coverage and release gate.

Regular table destinations show their group/run number in every arrangement,
matching placement feedback and Table overview. On a crowded board, More → Find
selected tiles reveals a hidden rack; Find latest placement locates an unfinished
edit, or the marked latest play after Undo. See the
[crowded-board review](docs/CROWDED_BOARD_REVIEW.md) for verification and limits.

Comfortable reading keeps table and rack tiles fully reachable when returning from
Full screen to Standard after rotating the device.

Whole-turn practice keeps keyboard focus on your tiles after Reset, even when
an earlier save warning remains visible. New warnings still receive focus.

Complete-match verification and save-integrity findings are recorded in
[the match review](docs/MATCH_REVIEW.md). To repeat the six seeded matches from
fresh deals, run `node scripts/review-matches.mjs --out=/tmp/match-audit.json`.
Imported match scores must be whole, zero-sum values consistent with the winner,
cumulative totals and, at results, the final racks. Invalid backups leave the
current game intact.

A free, browser-only tile-rummy game: build runs, make groups, and empty your rack
against one to three computer opponents. No account, server, or database is needed.

## Play locally

Use Node.js **20.19+ or 22.12+** (Node 22 LTS recommended).

```sh
git clone https://github.com/cisohabitat/RunSet.git
cd RunSet
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Language / 语言

Choose **English** or **简体中文** from the language selector at the top of any
screen. Chinese browsers start in Simplified Chinese unless a language has already
been chosen. Your choice stays on this device and switching preserves games,
lesson progress and selected tiles. Both languages work offline once readiness
is confirmed. Names entered by players are preserved.

在页面顶部选择 **简体中文**，即可使用中文游戏、玩法说明和练习。第一次玩，
建议先点 **学习玩法**，跟着提示一步一步做。中文练习使用更大的文字和按钮，
可上下滑动查看完整说明和牌桌。可随时切回 English，不会丢失进度。

See [localization notes](docs/LOCALIZATION.md) for terminology and verification.

## Comfortable reading / 大字舒适模式

Open **Settings → Comfortable reading** (中文：**设置 → 大字舒适模式**) on any
screen for 18 px main text, 16 px supporting labels, larger tiles and buttons,
and a scrolling layout. Selected tiles have a visible check mark. Turn the mode
off to return to the compact layout; selections and progress are preserved.
Settings also groups sound effects, opponent speed and learning help. Preferences
stay on this device, work offline and survive game deletion. Turn timers continue
while settings are open, with a visible reminder. The independent large-tile
option remains available when comfortable reading is off.

See [reading-mode verification](docs/READING_MODE.md). The older-player study and
real-device checks (Phase 1) are paused; Phases 2–5 are implemented. The remaining
phases are tracked in [the roadmap](docs/ROADMAP.md).

## More room for the table / 放大牌桌

Choose **View → Full screen** (**视图 → 全屏**) above the board for a viewport workspace
that keeps your rack and turn controls on screen. **Standard** (**常规**)
or Escape returns to the regular layout. The choice is remembered across turns
and reloads. In expanded view, **More** contains sorting; tiles and the board
still scroll normally. Hints, their placement buttons and the timer stay available.
The compact countdown also shows its draw/pass expiry action and exposes the
unfinished-edit reset explanation to assistive technology.

The standard phone board has more space, comfortable reading uses taller boards
on tablets, and phone/tablet practice no longer squeezes melds beneath fixed-height
instructions. Practice pages scroll, and continuation buttons are brought into
view when needed. See [board-space verification](docs/BOARD_SPACE.md).

## Results and replay

Results explain whether someone emptied their rack or the pool ran out and
all players passed, including a seat-order tie-break when needed. Each score
shows what was gained or deducted. Expand **Show remaining tiles and calculation**
to see the actual numbers, including 30 points for each unplayed joker.

**Play again with same settings** starts a fresh deal with your name, opponent
count, difficulty, timer and guidance choice. Match scores start from zero.
**Change settings** opens your current choices for editing. In an unfinished
match, **Deal round N** continues the existing score; **Start over with same
settings** resets it. Replacement still requires confirmation, and Cancel keeps
the saved result. See [results verification](docs/RESULTS_AND_REPLAY.md).

## What’s included

- English and Simplified Chinese screens, all three lessons, hints, penalties,
  timers, results, backup/recovery notices, and accessible tile labels.
- The full 106-tile deck, seeded shuffle, random seats, and 14-tile deals.
- Groups, runs, jokers, 30-point opening melds, and table rearrangements.
- Joker retrieval by exact replacement and same-turn reuse; no table tiles return
  to a rack. Invalid completed turns restore the table and draw up to three tiles.
- Easy bots play new melds; Normal also adds tiles to existing melds; Hard searches
  table re-partitions within a bounded 400 ms planning budget and retains a legal
  Normal fallback. Every bot submission passes through the human turn validator.
- Setup, illustrated rules, game table, results, and single-round scores.
- Optional multi-round matches to 100/200/500 points with a persistent scoreboard
  and round history. Optional 60/120-second turn timers default to off.
- Turn-local undo, expandable racks/tables, restart confirmations, and a remembered
  large-tile option. Installable offline play preloads practice and planner assets;
  updates wait for an explicit Save and update action.
- Optional worker-planned move hints with explicit preview/placement, point breakdowns,
  specific table corrections, bot narration, remembered pacing, and beginner penalty warnings.
- Optional first-game guidance defaults to on in setup, follows selected tiles and
  opening points, and explains safe End/Reset/Draw/Pass choices. Valid destination
  outlines use the same turn validator; intermediate edits stay available.
  See [first-game guidance](docs/FIRST_GAME_GUIDANCE.md).
- Guided first-game practice and optional joker/rearranging lessons, stored separately
  from regular games. Reset and Undo return the opening lesson to the missing
  objective; reopening practice also recovers previously stuck opening lessons.
  Restarting clears selections, and early Draw/End actions explain the current step.
  Lesson continuation buttons stay in the visible game action bar. Safe delete and new-game replacement confirmations.
- Readable light/dark tile colours, visible lesson navigation, action-first hints,
  compact backup help, and a winner-first results display. Optional lessons retain
  their completed table and explain joker replacement before reuse. Empty-pool
  hints and timer/coaching help consistently recommend Pass.
- Desktop, tablet, and phone layouts with 44 px targets, an optional 48 px comfortable mode, a compact player dock,
  contained table/rack scrolling, and iPhone safe-area padding.
- Tap/click selection, desktop dragging, keyboard-operable destinations, sorting,
  reset, draw/pass, live validation, and move history.
- Versioned localStorage autosave, including unfinished turns, and Continue.
  Writes validate the complete position; older hint saves with damaged Undo history
  recover their current tiles with a visible notice.
- Synthesised sound with a remembered mute toggle; responsive layouts, shape marks
  for colours, system dark theme, and reduced-motion support.

Implemented from the user-provided RunSet game specification. The original PDF
is kept locally and is not included in the public repository.
No brand names or third-party tile artwork are used by the game.

## Controls and rules

Select one or more tiles, then choose **New group or run** or the add button under an
existing meld. Dragging supports one tile or a selection. Return newly played
rack tiles with **Return selected tiles to rack** or by dropping onto your rack.
Use Tab to enter a rack or group, arrow keys or Home/End to move between tiles,
and Space/Enter to select. N places a selection in a new group or run, Ctrl/⌘ Z
undoes, H requests a hint, and Escape clears the selection. Restart, deletion,
offline tools, and keyboard help are available in the Game menu. Reading, sound,
opponent pace and learning preferences are available in Settings on every screen.

Open with at least 30 points from your own rack before touching table tiles.
After opening, rearrange freely, keeping every meld valid. **Reset turn** restores
all moves without a penalty. **Draw a tile** restores unfinished moves, draws one,
and ends the turn. An invalid **End turn** restores the table and draws three
penalty tiles (or fewer if necessary). An empty pool changes Draw to Pass.

Jokers fill run gaps first, then the high end, or the low end when 13 is reached.
For ambiguous groups, missing colours are assigned in red/blue/orange/black order;
retrieve a joker using that exact colour and number, then reuse it in a valid meld.
When everyone passes, the lowest rack total wins. Ties use seat order. Jokers in
racks score 30; loser totals are negative and their sum is awarded to the winner.

Saves stay in the current browser and origin. Private browsing, clearing site data,
or unavailable/full browser storage may prevent persistence; the app reports storage
failures. Opening an old or corrupt save discards it with a notice.

## Development and verification

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:offline
npm run preview
```

`npm test` runs meld, turn-rule, tile-conservation, persistence, planner regression,
and seeded bot-versus-bot simulations. Simulations use shorter planning budgets to
exercise thousands of legal turns quickly; a separate populated-table check tests
Hard’s production time budget. Search is bounded, so a bot’s chosen move may vary
with device speed. Runtime dependencies are React and React DOM only.

`npm run test:e2e` uses Chromium (install with `npx playwright install chromium`
if needed, or set `CHROMIUM_PATH`). Tests cover practice, saved-game isolation,
delete/cancel/reload, and desktop/tablet/phone viewports. `npm run test:offline` verifies the production service worker, offline reload,
practice availability, and save-preserving updates.
The [fresh bug review](docs/BUG_REVIEW.md) records reproduced defects and fixes.
The [playtest follow-up](docs/PLAYTEST_FOLLOWUP.md) addresses the supplied live report.
Real-device Safari and
first-time-player usability sessions remain manual checks.

`npm run build` type-checks and emits a static site in `dist/`. GitHub Actions runs
installation, type-checking, tests, and the production build on pushes and PRs.

## Architecture

```text
src/
  engine/      Pure TypeScript tiles, melds, turn reducer, solver, bots, tests
  ui/          Home, setup, rules, game table, tiles, and results
  lib/         Versioned storage, worker client, and Web Audio sound
  workers/     Off-main-thread bot and hint planning
  ui/Offline   Installation, offline status, and explicit updates
  App.tsx      Screen navigation, reducer, autosave, bot scheduling
  main.tsx     React entry point
  styles.css   Responsive tokens, themes, tile art, and animations
```

The engine never imports React. Human and bot moves use the same pure reducer;
only tile IDs are stored in game state. See [AGENTS.md](AGENTS.md) for contributor
instructions.

## Deploy to Vercel

Import `cisohabitat/RunSet` in Vercel, select the **Vite** preset, and use:

- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Environment variables: none

`vercel.json` provides the SPA rewrite. Once linked, Vercel can deploy pushes to
`main` and create previews for pull requests. Repository configuration alone does
not create or link a Vercel project.

## Matches and timers

Choose a single round or a match target in setup. Scores accumulate across rounds;
**Deal round N** keeps players and totals and rotates the starting seat. A unique
leader reaching the target wins; ties continue into another round.

Timers are off by default. In a timed game, an expired turn restores unfinished
moves and draws one tile (or passes with an empty pool), not a three-tile penalty.
The deadline persists across tab closure and leaving the game. On resume, an
expired current turn is resolved. Practice is untimed. An expired turn closes an
outdated penalty warning so it cannot apply a penalty to the next player.

## Even more table space

Choose **View → Table only** (**视图 → 只看牌桌**) to give the melds
more room while inspecting or rearranging them. **Full screen / 全屏** brings
your tiles back; selected tiles and edits stay intact. Turn buttons remain
available. The rack returns automatically on the next turn, on leaving Expanded
table, or after reload. This is separate from tile size and works with Comfortable
reading too. See [measured gains and checks](docs/TABLE_INSPECTION.md).

## iPhone standard tiles

Standard phone play uses shorter **44×54 px tiles**, keeping 25 px numbers and a
44 px tap width. Tighter gaps show more rack tiles and fit melds more efficiently.
This also applies in phone landscape. Comfortable reading and Larger touch
controls keep their larger sizes. See [phone tile measurements](docs/PHONE_TILES.md).

## iPad landscape

Standard landscape play uses smaller **44×60 px tiles**, tighter meld spacing,
a shorter heading/header and side-by-side game information to show more of the
table. This applies automatically to touch tablets with enough landscape space.
For the densest view, leave Comfortable reading and Larger touch controls off;
both preferences still provide their larger tiles when enabled. Portrait
rotation preserves your selected tiles and game. See
[iPad landscape verification](docs/IPAD_LANDSCAPE.md).

## Listen to instructions / 听一听

In Learn to Play, tap **Listen / 听一听** to hear the current instruction. Use
**Replay audio / 再听一次** or **Stop audio / 停止朗读** anytime. During regular
play, open **More / 更多 → Listen to reminder / 听一听提示** for the current
next-action reminder. Chinese instructions use a Mandarin voice; English uses
an English voice. Written instructions stay available and nothing plays automatically.
Delivery is lightly brighter and unhurried; the voice's character depends on the device.

RunSet uses your browser/device's reading voices, separately from game sound
cues. Installed matching voices are preferred. Offline speech requires an
installed voice; some devices only offer network voices. If no suitable voice
is available, the game explains how to retry or add one. See
[read-aloud behavior and verification limits](docs/READ_ALOUD.md).

## Roadmap

The [premium improvement cycle](docs/PREMIUM_ROADMAP.md) tracks the current
phase-by-phase work, with exact-commit GitHub CI required between releases.
The [shorter play flow](docs/PREMIUM_PLAY_FLOW.md) makes Continue primary for
saved games, starts new players with one Easy opponent, and keeps custom setup
options behind a disclosure. Existing replay options are preserved.
The [shared visual foundations](docs/PREMIUM_VISUALS.md) add native bilingual
fonts, tabular tile numbers, clearer control boundaries and consistent focus,
corners and surfaces in both themes while retaining device tile dimensions.
Phone hint previews keep Place/Dismiss reachable; Why this works retains the
full move description and opening calculation.
The [feedback improvements](docs/PREMIUM_FEEDBACK.md) distinguish actual latest
plays with static corner marks, add brief reduced-motion-safe placement feedback,
and make quieter sound effects follow actual accepted game changes.
CI installs Chromium's full dependencies using Ubuntu's official HTTPS archive
mirror with bounded download retries; this avoids the observed Azure mirror
stalls without skipping browser or offline checks.

See the [improvement roadmap](docs/ROADMAP.md) for phase status and acceptance
criteria. Guided learning, safe deletion, device layouts, contextual hints, undo,
offline installation, matches, and timers are implemented. The [fresh bug review](docs/BUG_REVIEW.md) records reproduced defects and fixes.
The [playtest follow-up](docs/PLAYTEST_FOLLOWUP.md) addresses the supplied live report.
Real-device Safari and
first-time-player usability sessions remain manual verification items.

Online multiplayer is deferred at the user’s request and is outside the active
roadmap. No workspace authorization or shared backend is needed for the current
game. The [archived multiplayer proposal](docs/MULTIPLAYER.md) is retained for
possible future discussion.

The [current improvement cycle](docs/IMPROVEMENTS.md) tracks follow-up work from
the live review. Saves now synchronize between tabs and reject stale writes;
advanced lessons require their full objective and replacement timers begin only
when confirmed.

Practice highlights the current destination, corrects wrong selections, and
requires the demonstrated result. Completing a lesson offers a real Easy game
with optional coaching. Hint previews include a “Why this works” breakdown.
The [beginner study](docs/BEGINNER_STUDY.md) is prepared but has not been run.

Save tools on Home and in the Game menu export/import versioned JSON backups and
recover a previous valid position. Imports are validated before confirmation and
never silently replace a game. Deleting progress clears automatic recovery; files
you downloaded remain available. “Ready offline” is shown only after the active
service worker verifies its cached assets. The game heading shows save status.

Run `npm run benchmark -- --seeds=2 --budget=380` for fixed-deal bot comparisons
and legality/latency measurements. See [the measured pilot and its limitations](docs/BENCHMARKS.md).
Hard uses more rearrangement search; the current small sample does not establish
that it wins more often than Normal. Hints can now search table rearrangements.

The [bot difficulty review](docs/DIFFICULTY_REVIEW.md) examines production-budget
head-to-head and three-player rounds, all seat orders, rejected joker plans and
planning cost. Reproduce with `node scripts/review-difficulty.mjs --mode=mixed`
or `--mode=pairs`; defaults are ten seeded deals and a 380 ms planning budget.
Reports checkpoint each round and label completion explicitly. The
[reliability follow-up](docs/PREMIUM_BOTS.md) validates complete joker turns
during planning, keeps legal alternatives, stops at a rack-empty finish and
reserves runtime headroom with a 240 ms work cap. It uses separate held-out deals;
the historical reports retain the original rejected proposals.

Quick exercises cover opening with 30 points, extending a run, filling a gap and
replacing/reusing a joker. They provide visual clues, explicit Check move and
separate resumable progress, without timers or penalties. See
[focused learning](docs/PREMIUM_EXERCISES.md).

Lessons and quick exercises offer optional recorded English/Mandarin guidance,
with Listen, Replay, Stop and a Device voice choice. The 34 static clips are
cached when Ready offline appears. Human pronunciation/prosody review remains
paused. See [narration behavior and generation](docs/PREMIUM_NARRATION.md).

Quick exercises support replay by puzzle number (1–999999); 4321 keeps the
original exercises. New numbers vary colours/values, with matching clues and
real-rule checks. Local progress deduplicates completions and marks all four
exercise types without accounts or streaks. See [solo puzzles](docs/PREMIUM_SOLO.md).
The [physical-device and beginner acceptance checklist](docs/PREMIUM_ACCEPTANCE.md)
is prepared; the user-paused study and native listening review have not run.

The completed [quality follow-up](docs/QUALITY_ROADMAP.md) audited bot difficulty,
accessibility, and performance/recovery, with a separate published CI gate for
each phase. Physical-device and beginner studies remain paused.

The [larger bot audit](docs/QUALITY_BOTS.md) covers 360 rounds and 39,212 turns
with no rejected proposals or measured calls over 400 ms. Easy remains the
learning default; Normal/Hard results overlap, so labels describe strategies.
CI benchmark smoke now checks submitted plans before safe draw/pass fallback.

CI retains full coverage with bounded job/offline execution and cancellation of
superseded runs to limit delays from a stalled runner.

The [accessibility audit](docs/QUALITY_ACCESSIBILITY.md) adds keyboard skip
navigation, clear screen/lesson focus, main landmarks and stronger warning/rule
contrast. Automated English/Chinese checks cover ten screen states, keyboard
lesson completion and comfortable-text reflow at 320 CSS pixels.

The [performance and recovery audit](docs/QUALITY_RECOVERY.md) adds a bilingual
recovery screen, save-before-reload protection, safer offline-update retries and
retention of the previous working cache. Crowded boards avoid redundant tile
renders; a 1000-turn soak checks saves and backup round trips. Regression coverage
now includes 114 unit tests, 199 browser flows and 17 production-offline flows.

The [confidence and enjoyment cycle](docs/ENJOYMENT_ROADMAP.md) adds clearer turn
ownership and a More → What can I do now? reminder with the last completed turn.
Multi-opponent guidance now counts how many opponents play before you.

Move hints now offer an optional Preview: a read-only proposed table with
rack-tile outlines, labelled destinations and rule explanations. Closing it
preserves the draft; Place hint remains explicit and does not end the turn.

Setup includes a bilingual opponent comparison and advice for the selected
style: Easy creates new melds, Normal also extends them, and Hard also searches
rearrangements after opening. All use the same rules without seeing your rack;
hints remain equally available. Change style for a fresh game.

Results compare remaining rack totals visually against each round score and
show one learning takeaway drawn from your actual final rack. Existing tile
arithmetic, match totals and replay/settings controls remain available.

Quick exercises offer an optional daily puzzle based on the device's local date.
An open puzzle keeps its date across midnight/reload; the new daily offer does
not replace it. Clues progress from a rule reminder to suggested tiles and the
next step. There are no streaks, deadlines or missed-day penalties.

The [final enjoyment-cycle audit](docs/ENJOYMENT_RELEASE.md) covers 118 unit tests,
233 browser flows and 19 production-offline flows. Loading screens retain keyboard
landmarks, completed rounds focus results, and opponent choices wrap in narrow
comfortable-reading views. Publication to GitHub and a ready Vercel deployment
are checked separately; later deployments were queued during this audit.

Cross-browser production coverage is available with `npm run test:compat`: WebKit
phone/tablet and Firefox desktop checks complement Chromium. See
[the reliability cycle](docs/RELIABILITY_ROADMAP.md). This is not physical Safari testing.

Install cross-browser dependencies with `npx playwright install --with-deps
chromium firefox webkit`. Headless Linux audio checks need a virtual PulseAudio
output; CI starts a null sink so actual MP3 decoding/playback is exercised.

More → Review latest play shows each newly played tile in its completed destination
with a rule explanation. It is read-only and preserves current edits and selection.
Results can review the final play too; intermediate rearrangement order is not recorded.

Quick exercises can suggest an optional goal from the saved final rack or local
completion record, explaining why. Existing exercise drafts remain open; results
now link directly to practice. Suggestions do not change regular saves.

Settings → Higher contrast strengthens text, tile colours and borders in both
light and dark themes. It is independent of comfortable reading and tile sizes,
keeps selections/drafts, and remains enabled after deleting a game.

More → Take a break saves the latest position before returning Home. Unfinished
moves are kept and explained on the saved-game card. A failed save leaves the
table open for retry. Untimed games can wait; timed games retain their deadline
and draw/pass on returning after expiry. Settings → Opponent pace also offers
Unhurried (five seconds before planning), independently of difficulty and timers.

The completed implementation and per-phase verification gates are recorded in
[reliability release evidence](docs/RELIABILITY_RELEASE.md). Physical Apple,
older-player and native Mandarin acceptance checks remain paused.

Settings → Simple home screen offers large Continue, New game and Learn choices.
More options contains rules, quick exercises, delete and backup tools. It keeps
saved games and other display choices, works offline after verified preparation,
and stays enabled after deletion. The full home screen remains the default.
Implementation notes are in [easier independent play](docs/INDEPENDENT_PLAY_ROADMAP.md).

If the optional home view cannot download, Return Home recovers the full home
screen while keeping the saved game and other preferences.

CI rewrites both direct Ubuntu sources and runner APT mirror-list files to the
official HTTPS mirror, retaining signed package checks and browser dependencies.

During your turn, Zoom beside a group/run opens a read-only magnifier with larger
tiles, joker values and a rule explanation. Long runs scroll inside the panel;
Back to table and Escape preserve your draft and selection. Timed games keep
their deadline. The regular board retains its compact tile sizes and row density.

Tap the selected-tile count to inspect exactly what is selected before choosing a
destination. A confirmed relocation briefly marks its destination and announces
the actual moved count; opening progress and invalid-group warnings remain.
Rejected regular moves retain selection for another attempt. No confirmation is
shown merely because a move was requested, and no extra toolbar row is added.

Comfortable phone controls use compact tile-count labels and bounded spacing,
keeping readable text, 48 px targets and the expanded table space.
The expanded rack also bounds spare vertical padding across browser font metrics.

Settings → Set up together offers a five-step English/Chinese checklist for
family or carers. Choose the language there, then jump to display settings and
choose reading size, contrast, Simple home, sound and opponent pace. Choices
remain optional; opening the guide keeps the current game and timer deadline.

[Independent-play release evidence](docs/INDEPENDENT_PLAY_RELEASE.md) records
phase CI, responsive/offline checks and the paused human acceptance work.

The completed tile-handling cycle is [easier tile handling](docs/TILE_HANDLING_ROADMAP.md).
During your turn, More → Arrange rack lets you choose a tile and move it left or
right, then Keep order. Cancel keeps the previous display. This optional order
is separate from saved tile positions and survives Undo/Reset and reload for the
same round. Newly drawn tiles append; Colour/Number return to automatic sorting.
Practice retains its own order. The panel does not pause timed games.

CI runs its complete browser suites in parallel jobs after quality checks. Wait
for the whole exact-commit workflow before treating a phase as accepted.

More → Find selected tiles cycles through your selected rack/table tiles. It
reveals a hidden rack when needed. Find latest placement locates the last actual
edit, including a placed hint; after Undo it can locate the latest completed play.
Both controls preserve selection, saved tiles and timed deadlines.

More → Why this move? explains an observed blocked move or unfinished draft,
shows its affected tiles and gives one safe next action. Where possible it
previews one matching rack tile; nothing is placed automatically. The read-only
panel preserves selection and timed deadlines. Bot narration describes only the
actual completed bot turn, keeping rejection and Undo notices plain.

Learn to play → Practise a whole turn offers a complete opening with steps,
followed by a voluntary attempt with fewer prompts. You choose the tiles and
when to End turn. Show/Hide practice steps preserves the current selection and
draft. Incomplete turns can be checked safely without a penalty; Draw explains
that it ends the turn and offers a restart. The finished table stays read-only.

Whole-turn progress uses its own bounded `runset.turnPractice.v1` action record
and resumes offline. Regular saves and short-lesson drafts are preserved. A
damaged practice record starts a fresh table with a notice; failed writes leave
the current practice playable with a visible warning. Restart clears only this
practice. Newly written guidance uses device speech until matching recordings
are available; Listen remains explicit.

[Tile-handling release evidence](docs/TILE_HANDLING_RELEASE.md) records the
phase gates and combined keyboard/touch, responsive, cross-browser and offline
journeys, including backup/delete/restore and preserved learning preferences.
In Chinese, More → 出牌帮助 explains both blocked moves and unfinished drafts.
Physical-device and older-player acceptance remains paused.

Learn to play → Practise a whole turn now also offers adding to a run,
rearranging runs, replacing/reusing a joker and choosing when to draw. Pick a
lesson, then Start selected lesson; changing the selector alone keeps the current
draft. Finish the stated goal and explicitly End turn (or Draw in its lesson).
Older whole-turn drafts continue as opening practice. The new cycle is tracked in
[learning and portability](docs/LEARNING_PORTABILITY_ROADMAP.md).

Each whole-turn lesson has four layouts with different colour families and rack
orders. Start next practice layout starts a fresh attempt of the same lesson;
Restart repeats the current layout. Optional steps and the quieter attempt remain
available, and toggling steps keeps the current selection. Instructions, tile
highlights, goal checks and saved progress all follow the selected layout.

Home → Portable progress exports one profile file containing the game, supported
learning progress and display/sound choices. Open a profile to review it before
restoring. You can leave “Also restore the game” unchecked to keep the current
game. Items absent from the file stay on this device. A successful restore reloads
the page to apply preferences; the imported game's original turn, deadline and
Undo history remain. Existing game-only export/import still works separately.

Profiles support short lessons, whole-turn lessons/layouts, quick exercises, solo
progress, language, reading, contrast, tile size, Simple home, pace, sound/voice
choice, expanded view and rack order. Installed device voices are not transferred.
Files are validated before changes; failed writes attempt to restore prior raw
values and never trigger a success reload. No account or server is introduced.

Import review now compares the device's game and whole-turn practice with the
file, including unfinished edits, lesson/layout, guidance mode and original timed
deadline. Expand the learning or display/sound lists to see replacement scope.
An existing game is kept by default; select “Also restore the game” to replace it.
Game-only backup confirmations say Restore backup, while fresh deals still say
Start new game.

Returning to whole-turn practice shows what was restored and whether to continue
editing, End turn or restart an attempt that ended by drawing. Reading the summary
or toggling steps preserves the draft and selection. The joker goal also accepts
a legal fourth tile after the required replacement and reuse.

[Learning and portability release evidence](docs/LEARNING_PORTABILITY_RELEASE.md)
records the phase gates, profile transfer/recovery checks and paused human work.

Move help identifies the affected group/run and offers Find affected tiles,
returning to the actual board tile without changing selection. A suggested tile
explains whether it repairs just that meld or leaves the turn ready for End turn.
The current improvement cycle is [confident and comfortable play](docs/PLAYER_COMFORT_ROADMAP.md).

During a game, More → Opponent styles and fair play explains each named
opponent's actual level, the shared opening rule, hidden-rack limits and why a
draw does not establish that no move exists. Pace changes waiting time only.

The [fresh bot recheck](docs/PLAYER_COMFORT_BOTS.md) records 60 production-budget
rounds without changing strategy or claiming a human difficulty rating.

More → Table overview helps navigate crowded games. Review numbered melds and
choose one to find its first tile. It preserves selections, the hidden-rack view,
Undo history and the current deadline; unfinished melds say Needs fixing.

During an opponent's turn, the existing action buttons say Opponent turn and
Please wait, including full-screen/table-only views. No extra meld-area row is
added. New wins use a brief twelve-piece celebration; reopening, reloading or
importing completed results does not replay it or the win sound. Reduced motion
keeps the same static result information. Recovery text offers Home or save and
reload without assuming every screen error is a network problem.

Save tools load separately inside their own Home/menu loading boundaries and
remain in the offline cache. The initial download budget stays at 100,000 gzip
bytes. Fixture-only CI visual captures support phone/tablet review when the local
execution workspace is unavailable; these are not physical Apple-device tests.

The CI browser matrix now runs Chromium, phone WebKit, iPad WebKit, desktop
Firefox and offline checks as separate jobs. Each compatibility project keeps
all of its cases. The complete aggregate check remains required, with the same
twenty-minute job and five-minute offline limits.

The player-comfort release now has a connected bilingual regression journey:
resume an interrupted timed draft, use opponent guidance and both tile-finding
tools, complete the game, export its actual backup, delete progress and recover
the file offline. It checks exact deadlines/history, 106 physical IDs, preference
retention and quiet restored results. Result explanations use factual labels
that also read naturally when the player's name is You.

See [release evidence](docs/PLAYER_COMFORT_RELEASE.md) for the phase gates,
automated coverage and the limits of emulated-device and voice verification.

The everyday-play cycle is tracked in [docs/EVERYDAY_PLAY_ROADMAP.md](docs/EVERYDAY_PLAY_ROADMAP.md).
More groups existing tools into help with this turn, finding/arranging tiles,
and game details, preserving the playing area and existing tool behavior.
Latest-play review includes all completed destinations and plain explanations of
matching-number groups and consecutive runs, with written limits on recorded history.
Long-session coverage includes 5,000 additional conserved turns, 200 backup round
trips and repeated crowded-table editing/reload. Selection and countdown renders
reuse game-state validation results; rules and deadlines are unchanged.
A temporary saved-game read failure preserves both saved copies and offers reload.
Queued or unseen writes are refused until a successful read reestablishes the save guard.
Recovery notices use larger text and touch targets in both languages. The bilingual
copy audit checks conditional messages and preserves names, numbers and values.
Final everyday-play release evidence is in docs/EVERYDAY_PLAY_RELEASE.md.

The [position-confidence roadmap](docs/POSITION_CONFIDENCE_ROADMAP.md) adds
**Practise this position** in More → Help with this turn. Try your current rack
and public table in a temporary copy, including unfinished edits. Undo, Reset
and Check affect only that copy. Return leaves your real game and selection
unchanged; timed real games keep running. Practice edits disappear on close/reload.
More → Find and arrange tiles → **Table arrangement** offers placed order,
groups then runs, or colour then number. This changes display only; original
meld numbers and destinations remain stable. The choice survives reload/deletion
and is included in portable profiles. Practice keeps its original table order.

Both home views show **Next when you continue** for a saved round: repair an
unfinished meld, reach the opening threshold, keep a ready play with End turn,
or wait for the opponent. The read-only summary uses the existing rule checks;
it never changes a save or resets its timer. Expired timed turns are processed
when continuing. Guidance is available in English and Simplified Chinese offline.
See [position-confidence release evidence](docs/POSITION_CONFIDENCE_RELEASE.md).

The [board and play refinement cycle](docs/BOARD_PLAY_ROADMAP.md) starts with
more compact unfinished-meld cards: explanations wrap within the tile-sized
card instead of forcing a wide row. Tiles, magnifier controls, original meld
numbers, and optional larger/comfortable views retain their sizes and meanings.
Desktop meld gaps are tighter, with the existing compact touch layouts retained.

Safe destination outlines are dashed; keyboard focus uses a separate solid ring.
Selected tiles retain their check mark and raised outline, while a corner dot
marks the latest completed play. Unfinished melds keep a written repair message.
These cues use the existing light, dark and high-contrast palettes.
Meld captions use normal case and spacing to avoid unnecessary wrapping.
Magnifier buttons fit their complete label across fonts while keeping a 44 px
minimum target and the existing larger comfortable-reading control.

Normal and Hard prefer more tiles once their opening reaches 30 points, and
check alternative first extensions to avoid blocking a winning run. Every plan
still uses the full rules validator and the existing bounded worker budget.
Easy's forgiving strategy and the one-Easy/no-timer default are preserved.

Resuming a table keeps latest-play markers static. Accepted edits get a brief,
small directional landing; rejected moves retain their selection with a written
reason and a distinct outline. Fresh human wins have a short flourish, while
reopened results stay quiet. Reduced-motion settings preserve the same facts.
See the [board/play release evidence](docs/BOARD_PLAY_RELEASE.md).

The [personal-comfort cycle](docs/COMFORT_MEMORY_ROADMAP.md) adds **Replay recent
turns** in More → Help with this turn and on results. Compare the public board
before and after the last six completed turns from this visit. Hidden racks and
intermediate rearrangement steps are excluded. Reloading or replacing a game
clears the replay; opening it preserves play and the original timer deadline.

Display colours: Settings → Reading and display → Display theme offers Light,
Dark or Follow device (the default). The choice works with Higher contrast,
updates without restarting play, is remembered separately on this device and is
included in portable profiles. Deleting a game keeps this display choice.

Round history is available from Home (More options on Simple home) and results.
It keeps up to 30 rounds finished on this device since the feature was added,
with actual round scores, recorded-round count and player-win count. Imported
or already completed games are not added. These optional local records stay
separate from game backups and portable profiles. Deleting a game keeps them;
Clear records asks for confirmation and keeps your game and settings.

Fresh games started in Simplified Chinese use familiar computer names prefixed
with 电脑 (computer). Changing language preserves existing saved/imported names
and the current turn. Home, setup and review text uses plain, friendly Chinese;
recorded lesson instructions stay consistent with their narration. During a
computer turn, the rack can still receive keyboard focus for scrolling.

This comfort/memory cycle is tracked in [the roadmap](docs/COMFORT_MEMORY_ROADMAP.md)
and [release evidence](docs/COMFORT_MEMORY_RELEASE.md).

Visual polish: Settings display and pace selectors share readable 48 px controls,
wrapping to keep choices inside phone dialogs. Landscape iPad opponent activity
marks preserve room for difficulty and tile counts. The next published phases
are tracked in [the polish/confidence roadmap](docs/POLISH_CONFIDENCE_ROADMAP.md).

Turn status distinguishes unfinished edits from a draft ready to end, while
keeping opening points and tile counts visible. Ready to end turn is a prompt:
choose End turn to submit it. Completed turns advance play or open results;
Reset/Undo and penalty cancellation keep the same game rules and deadlines.

Round history can be filtered by computer difficulty. Mixed-level rounds match
once if any computer used that level; displayed win counts apply to shown
records. Expand a dated round to read every participant's actual score. Filtering
is read-only and resets to All when the panel is reopened.

Clearing history always removes all recorded rounds, including filtered-out
records; the confirmation states this explicitly and preserves game/settings.

History summaries show the date, round and winner; expanding a round also shows
its full recorded time. Footer actions share space according to label width so
phone views retain readable text and full touch targets with fallback fonts.

Use Check for updates on Home or in the game menu to look for a new version.
Checking keeps your current turn open; it does not reload or accept an update.
Offline and failed checks explain how to retry. When a version is ready, choose
Save and update. Saving is checked before activation and again before reloading;
if saving fails, keep the tab open and try again. Timed turns keep running.

Offline tools load separately with a local fallback, so a failed tool download
leaves Home and your game usable. Wait for Ready offline before disconnecting.

The next improvement cycle is tracked in
[Everyday quality](docs/EVERYDAY_QUALITY_ROADMAP.md): live release acceptance,
clearer menus, Mandarin rule examples, a larger bot evaluation and longer browser
sessions. Each phase is published separately and requires complete CI before
the next begins. Physical-device and older-player studies remain paused.

Home offers one How to play action: directly on full Home, or under More options
on Simple home. The rules page omits its own rules shortcut so Back keeps its
original destination. During play, the menu puts Practice · keep this game first and
Delete saved game last. Restart game still asks before replacing the current
round with the same players/settings. Menu text uses readable 16/18 px sizes and
48 px controls, and reopening starts at the first choices.

How to play now includes expandable examples in English and Simplified Chinese:
two complete new groups worth 24 + 6 points make a 30-point opening, and a
before/after sequence shows exact joker replacement and reuse in the same turn.
These are read-only diagrams; opening them keeps your saved game and deadline.

CI runs the complete offline suite as two isolated shards. Each keeps a
five-minute test-step limit and its own checkout/build, so real-worker update
fixtures cannot affect the other shard. The aggregate check requires both shards
and every other browser job. Local shards sharing one build must run sequentially.

The larger bot review adds validated same-position opening opportunities, missed
known Normal finishes, per-round accepted actions and rack accounting to the
existing legality and full-call timing audit. It evaluates production strategies;
the review does not change opponent behavior or the Easy default. Opening and
finish baselines are bounded comparisons, not an exhaustive search for every move.
The [larger review](docs/EVERYDAY_BOTS_REVIEW.md) completed 120 balanced rounds
over ten seed blocks per format, with zero rejected proposals or calls over
400 ms on its Node host. It preserves raw reports and explains the limited
finish coverage and correlated deals; it is not physical-device performance.

Extended-session browser checks exercise 121 real edits with Undo capped at 100,
rotation, a failed-write/retry, reload and actual Undo, plus three real finished
rounds. Separate timed cases return after 20 minutes of logical Home time and
check one expiry draw against the original deadline. Both languages run in
Chromium and offline WebKit phone/iPad and Firefox. Chromium additionally samples
retained heap/DOM and a native freeze/resume. These are bounded automated smoke
checks, not physical Apple background, battery or older-player evidence.
The regular table's decorative heading scrolls with the melds, keeping it from
covering a destination after native scrolling, particularly in Firefox.
See the [session review and raw samples](docs/EVERYDAY_SESSION_REVIEW.md).
For the optional production Chromium resource audit, build and run
`npx playwright test --config=playwright.session.config.ts`.
Session checks await visible Saved feedback and complete native target geometry
after reload/Undo; persisted bytes can precede the final UI layout.
More also has a native scroll margin so larger fallback fonts keep its complete
touch target clear of the viewport edge.

The next cycle is [gameplay depth](docs/GAMEPLAY_DEPTH_ROADMAP.md), starting with
concrete endgame witnesses before complete-match and crowded-board reviews.
Hard checks small legal rearrangements before relying on a whole-table search,
preserving its existing legal plays and time budget. Easy remains the default;
Easy and Normal behavior, opening rules and joker restrictions are unchanged.
The [endgame review](docs/ENDGAME_REVIEW.md) records explicit before/after
fixtures, a separate 48-round audit and its limits. Reproduce a current diagnostic
with `node scripts/review-endgame.mjs --seeds=4 --out=/tmp/endgame-review.json`.
Simple one-tile transfers are checked before timed generic enumeration to retain
the crowded finish on cold runners. The review links a versioned full audit and
the correction's targeted recheck; original time limits remain unchanged.
