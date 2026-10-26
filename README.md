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
real-device checks (Phase 1) are paused; Phases 2–3 are implemented. The remaining
phases are tracked in [the roadmap](docs/ROADMAP.md).

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

## Roadmap

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
