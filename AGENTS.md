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
- Bot and hint searches run in `src/workers/planner.ts`. Abort outstanding requests
  when their state, screen, or confirmation context changes. Hints must not mutate
  drafts or end turns; explicit placement is validated by the engine.
- Match totals and per-round history must agree in saves; keep seat identity stable
  across rounds. Timed actions carry explicit event timestamps so the reducer
  stays deterministic. Expiry restores edits and draws once, never a penalty.
- Online multiplayer is explicitly deferred. `docs/MULTIPLAYER.md` is an archived
  proposal, not an active task. Do not request workspace access, provision backend
  resources, or add online-play functionality unless the user reopens that scope.
- Undo history is bounded to 100 snapshots of the current turn only. Clear it
  on reset, draw, or turn completion. Saves must validate every snapshot.
- Production builds generate `dist/sw.js` with static asset hashes. Never cache
  API routes. Updates require explicit acceptance and a successful game save.
  Run `npm run test:offline` when changing the service worker or update behavior.
- Guided practice uses `runset.practice.v1`, separate from the regular game save.
  Delete only the regular game key; preserve practice and preference keys. Cancel
  bot callbacks when a confirmation is open or a game is removed.
- Run `npm run test:e2e` for changed player flows; Playwright config uses installed
  Chromium or `CHROMIUM_PATH`. Browser tests belong in `e2e/`; Vitest covers `src/`.
- For UI changes, verify the affected player flow, responsive layout, and runtime
  console when browser tooling is available. Report any verification limits.
- For documentation-only changes, check accuracy, local links, and
  `git diff --check`; no need to rerun gameplay tests.
- Do not commit secrets, `.env` files, dependency folders, generated output, or
  local deployment metadata.

## Documentation and handoff

Keep `README.md` aligned with implemented behavior, tooling, commands, storage
limitations, and deployment setup. Update this file when conventions change.
Summarize changes and verification results. Commit, push, or deploy only when
requested; configuring Vercel is distinct from a successful live deployment.
