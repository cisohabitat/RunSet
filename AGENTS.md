# Contributor and agent guidance

## Scope and project

These instructions apply to the entire repository. RunSet is a static,
browser-only tile-rummy game built with React 19, strict TypeScript 5, Vite 7,
plain CSS, and Vitest. The original user-provided specification PDF is kept
locally at `docs/RunSet-Game-Specification.pdf` when available and is excluded
from the public repository.

## Architecture and rules

- `src/engine/` owns the rules and state transitions. Keep it independent of React,
  DOM, localStorage, audio, and network services. Use seeded randomness for deals.
- All gameplay changes go through the pure engine reducer. Bots submit plans to
  the same validator as humans. Never mutate React state or hide illegal moves
  behind UI-only checks.
- Keep all 106 physical tile IDs unique across the pool, racks, and table after
  every action. Turn snapshots are copies, not additional physical tiles.
- Preserve opening restrictions, joker replacement and reuse, rollback plus
  penalty draws, reset, passing, and single-round scoring when changing rules.
- Bot search must remain bounded: Hard’s total production planning budget is
  under 400 ms, with a legal Normal fallback.
- `src/lib/` handles browser storage and optional synthesised audio. Schema changes
  require explicit save migration or rejection with a visible notice.
- `src/ui/` renders screens and controls. Support keyboard and touch input, colour
  shape marks, 360 px layouts, dark theme, and reduced motion. Keep dependencies
  limited to React/React DOM at runtime. No backend or credentials are required.

## Working and verification

- Inspect files and Git status before editing. Preserve unrelated changes and
  check for more specific directory instructions.
- Install locked dependencies with `npm ci` using Node 20.19+ or Node 22.12+.
- Run `npm run typecheck`, `npm test`, and `npm run build` for gameplay changes.
  Add regression coverage for changed rules and preserve tile-conservation and
  bot-simulation checks. Tests may use smaller search budgets; retain a production
  Hard-budget regression check.
- Run `npm run benchmark` when changing planning strategy; report the seed set,
  search budget, timing host, and sample-size limits. Never assert a difficulty
  win-rate ranking from the small pilot. Benchmark scripts must not open servers.
- Workers send a ready handshake after imports. Keep startup and computation
  watchdogs separate, and preserve cancellation during either stage.
- Bot and hint searches run in `src/workers/planner.ts`. Abort outstanding requests
  when their state, screen, or confirmation context changes. Hints must not mutate
  drafts or end turns; explicit placement is validated by the engine.
- Match totals and per-round history must agree in saves; keep seat identity stable
  across rounds. Timed actions carry explicit event timestamps so the reducer
  stays deterministic. Expiry restores edits and draws once, never a penalty.
- Online multiplayer is explicitly deferred. `docs/MULTIPLAYER.md` is an archived
  proposal, not an active task. Do not request workspace access, provision backend
  resources, or add online-play functionality unless the user reopens that scope.
- Hint placement must capture exactly one conserved snapshot before either table
  or rack changes. Generated meld IDs must remain unique after deletions/splits.
- Validate a position before saving; invalid writes must preserve the previous save.
  Recover a damaged Undo history only if the remaining complete state validates,
  and show a notice. Save validation must return false for malformed nested input.
- Enforce turn expiry on timestamped gameplay actions as well as polling ticks.
- Bound optional game context so combined match, timer, coaching and touch options
  cannot push primary controls outside the viewport. Test combined options.
  Include 1180×757 laptop bounds with populated melds and an open hint; inspect
  complete tiles and meld controls, not only the table element or dock.
- Guidance and planner error fallbacks must say Pass when the pool is empty.
- Undo history is bounded to 100 snapshots of the current turn only. Clear it
  on reset, draw, or turn completion. Saves must validate every snapshot.
- Production builds generate `dist/sw.js` with static asset hashes. Never cache
  API routes. Updates require explicit acceptance and a successful game save.
  Run `npm run test:offline` when changing the service worker or update behavior.
- Game writes are asynchronous and serialized through `runset-game-save` Web Locks
  where supported, with snapshot comparison and a per-document generation guard.
  Handle storage events before writing remote state; do not bypass `persistGame`.
  Await delete completion before reporting success or reloading.
- Guided practice uses `runset.practice.v1`, separate from the regular game save.
  Opening-lesson steps must follow valid table objectives after Reset/Undo, and
  resume must recover older inconsistent steps. Test all three lessons with touch
  and mouse input, not only their engine plans. Restart must clear local tile
  selections; out-of-sequence tutorial actions must explain the current step.
  Validate lesson destinations before moving tiles, including partial objectives.
  Optional lessons must explicitly confirm completion and retain a read-only
  final table. Explain the intermediate on-table joker before asking for reuse.
  Delete only the regular game key; preserve practice and preference keys. Cancel
  bot callbacks when a confirmation is open or a game is removed.
- Run `npm run test:e2e` for changed player flows; Playwright config uses installed
  Chromium or `CHROMIUM_PATH`. Browser tests belong in `e2e/`; Vitest covers `src/`.
- After each phase push, inspect GitHub Actions for that exact commit and wait
  for all checks, including offline tests, to pass before starting the next phase.
  A successful Vercel status or local run is not proof of successful GitHub CI.
- Backups must pass `validSave` and the versioned backup format before replacement.
  Delete both regular progress and its automatic recovery copy, keeping preferences.
- For UI changes, verify the affected player flow, responsive layout, and runtime
  console when browser tooling is available. Report any verification limits.
  Inspect screenshots in light and dark themes. Hit-test important controls before
  clicking so automatic scrolling cannot hide clipped actions. Preserve visible
  hint actions, lesson navigation, and at least 4.5:1 tile-text contrast.
- For documentation-only changes, check accuracy, local links, and
  `git diff --check`; no need to rerun gameplay tests.
- Do not commit secrets, `.env` files, dependency folders, generated output, or
  local deployment metadata.

## Documentation and handoff

Keep `README.md` aligned with implemented behavior, tooling, commands, storage
limitations, and deployment setup. Update this file when conventions change.
Summarize changes and verification results. Commit, push, or deploy only when
requested; configuring Vercel is distinct from a successful live deployment.
