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

## What’s included

- The full 106-tile deck, seeded shuffle, random seats, and 14-tile deals.
- Groups, runs, jokers, 30-point opening melds, and table rearrangements.
- Joker retrieval by exact replacement and same-turn reuse; no table tiles return
  to a rack. Invalid completed turns restore the table and draw up to three tiles.
- Easy bots play new melds; Normal also adds tiles to existing melds; Hard searches
  table re-partitions within a bounded 400 ms planning budget and retains a legal
  Normal fallback. Every bot submission passes through the human turn validator.
- Setup, illustrated rules, game table, results, and single-round scores.
- Tap/click selection, desktop dragging, keyboard-operable destinations, sorting,
  reset, draw/pass, live validation, and move history.
- Versioned localStorage autosave, including unfinished turns, and Continue.
- Synthesised sound with a remembered mute toggle; responsive layouts, shape marks
  for colours, system dark theme, and reduced-motion support.

Implemented from the user-provided RunSet game specification. The original PDF
is kept locally and is not included in the public repository.
No brand names or third-party tile artwork are used by the game.

## Controls and rules

Select one or more tiles, then choose **New meld** or the add button under an
existing meld. Dragging supports one tile or a selection. Return newly played
rack tiles with **Return selected tiles to rack** or by dropping onto your rack.
Use Tab and Space/Enter for keyboard selection and destination activation.

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
npm run preview
```

`npm test` runs meld, turn-rule, tile-conservation, persistence, planner regression,
and seeded bot-versus-bot simulations. Simulations use shorter planning budgets to
exercise thousands of legal turns quickly; a separate populated-table check tests
Hard’s production time budget. Search is bounded, so a bot’s chosen move may vary
with device speed. Runtime dependencies are React and React DOM only.

`npm run build` type-checks and emits a static site in `dist/`. GitHub Actions runs
installation, type-checking, tests, and the production build on pushes and PRs.

## Architecture

```text
src/
  engine/      Pure TypeScript tiles, melds, turn reducer, solver, bots, tests
  ui/          Home, setup, rules, game table, tiles, and results
  lib/         Versioned storage and Web Audio sound
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

## Roadmap

Hints, multi-round matches, optional timers, single-move undo, installable offline
support, and online multiplayer are outside this version’s scope.
