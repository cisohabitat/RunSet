# RunSet

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
The active cycle is [easier independent play](docs/INDEPENDENT_PLAY_ROADMAP.md).

If the optional home view cannot download, Return Home recovers the full home
screen while keeping the saved game and other preferences.

CI rewrites both direct Ubuntu sources and runner APT mirror-list files to the
official HTTPS mirror, retaining signed package checks and browser dependencies.

During your turn, Zoom beside a group/run opens a read-only magnifier with larger
tiles, joker values and a rule explanation. Long runs scroll inside the panel;
Back to table and Escape preserve your draft and selection. Timed games keep
their deadline. The regular board retains its compact tile sizes and row density.
