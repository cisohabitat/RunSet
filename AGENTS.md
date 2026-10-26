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

## Languages and readable copy

- English and Simplified Chinese use `useI18n` from `src/i18n/I18n.tsx`. Translate
  displayed text, accessible labels and dynamic engine messages at the UI boundary.
  Keep engine state, tile IDs, action types and stored logs language-independent.
- Put Chinese copy in `src/i18n/zh-CN.ts`; keep 同数组 (group), 顺子 (run), 万能牌
  (joker), 开局 (opening), 摸牌 (draw) and 跳过 (pass) consistent. Use short, direct
  instructions with examples; do not assume prior knowledge of tile-rummy.
- Player-entered names remain literal. Message placeholders named `name*` must
  never be translated. Add dynamic-message tests when changing engine prose,
  hint/planner fallbacks, lesson steps or interpolation patterns.
- Language is the separate `runset.language` preference, retained on delete.
  Switching language must not remount gameplay or practice, clear selection,
  restart a timer or replace a save. Failed dictionary downloads must leave a
  usable language choice and a readable error. No translation service is used.
- Chinese lessons use larger text and page scrolling to keep tiles reachable.
  Verify actual tap targets on 360/375 px phones, tablet and laptop in both themes.
  Keep the Chinese dictionary and lazy rules in the offline precache; test switching
  languages after disconnecting before the first Chinese visit.

## Comfortable reading

- `runset.reading` is a separate, optional view preference. Preserve the existing
  `runset.largeTiles` tile-only preference, language, sound and learning settings.
  Deleting a game must preserve all view preferences.
- Comfortable reading uses `.comfortable-reading` on the existing App root.
  Never remount the game or lesson when changing it. Preserve tile selections,
  hints, timer deadlines and practice state. Main copy is 18 px, supporting labels
  16 px, tiles 58×80 px, and main controls at least 48 px tall.
- Large mode uses normal page scrolling with a bounded table and rack; avoid fixed
  panel heights that squeeze text or hide destinations. Test both languages at
  360×640, 820×1180 and 1180×757 and inspect light/dark screenshots.
- Settings is one dialog accessible from every screen. Retain the opener and
  captured dialog element through effect cleanup so Done/Escape restore focus in
  StrictMode as well as production. Bot callbacks pause while it is open; timed
  games continue ticking and must say so visibly.
- Selected tiles need a check mark plus the raised/outlined state. Translate
  invalid-meld labels in the DOM; do not embed English player messages in CSS.
- Settings and results load separately and are included in the generated offline
  precache. Verify first settings use while offline, not only a cached open dialog.
- The older Chinese-speaking player study and physical-device checks (new roadmap
  Phase 1) are paused by the user. Do not block Phase 2 on that study or claim it ran.

## First-game guidance

- Setup defaults `coach` on and lets the player opt out. Preserve its current
  value when restarting with the same players; older saves keep their own value.
- `src/lib/guidance.ts` owns deterministic display guidance and destination
  suggestions. Inspect hypothetical moves through the existing reducer and
  `turnCheck`, with empty temporary Undo history; never mutate the actual game.
  Keep opening, source-group validity and joker replacement/reuse restrictions.
- An outlined destination indicates that moving this selection there leaves a
  complete valid turn. It is a suggestion, not a restriction on intermediate
  editing. End turn still uses the authoritative reducer and penalty warning.
- End-turn explanations use `aria-describedby` and pool-aware Draw/Pass copy.
  Guided games also show the next action, progress to 30 and safe Reset advice.
  Keep the lesson-specific instructions for practice (`coaching=false`).
- In compact phone view, a visible beginner card takes priority over opponent
  cards. Restore opponents when the guidance is dismissed. Check the full next
  instruction inside the context bounds, plus primary controls and table space.
- Setup is lazy-loaded and must work on its first offline visit. Phase 2 GitHub CI
  run 40292228237 passed before Phase 3 work began. Phase 1 remains paused.

## Results and replay

- `src/lib/roundSummary.ts` infers rack-empty or exhausted-pool/consecutive-pass
  endings from validated final state. Report unknown causes honestly for completed
  saves that lack those conditions; do not invent a historical event or change
  the save schema. Match scores and winner selection remain engine-owned.
- Remaining jokers count as 30. Losers lose their full rack total; the winner
  gains the other totals without deducting their own remaining rack. Keep actual
  tile arithmetic and the winner's addition consistent with `results`.
- `settingsForGame` is the shared settings projection for replay, menu restart
  and the result screen's Change settings form. Copy name, opponent count,
  difficulty, target, turn length and current coaching choice, never old scores,
  seed, deal, Undo history or deadline. New timers start at replacement acceptance.
- Continue round preserves match totals; start over clears them. Keep replacement
  confirmation and cancellation. Importing a backup is not a fresh replay: its
  copy must not promise round 1/zero scores, and its deadline/history stay intact.
- Test English/Chinese results in compact/comfortable layouts, long names and
  large remaining racks. Details must wrap calculations and tiles on phones.
  Results and Chinese translation code remain lazy-loaded and precached offline.
- Phase 3 CI run 40295547425 passed before Phase 4 work began. Physical-device and
  older-player study work (Phase 1) remains paused; no multiplayer is added.

## Table space and expanded workspace

- The table toolbar is a direct child of Game, outside `.game-context`, so hints
  and optional guidance cannot scroll the Expand/Compact control out of reach.
  Test toolbar bounds against the game workspace, not the optional context.
- `runset.tableExpanded` is an optional regular-game view preference. Preserve it
  across turn remounts and reloads, and keep it through game deletion. Practice
  must not inherit or overwrite it. View changes do not change tiles or saves.
- Expanded view fills the viewport and retains the rack and primary controls.
  Keep its exit control, timer, save notices and hint actions usable. Sorting is
  available in More. Restore body scrolling and keyboard focus on exit/unmount;
  Escape must work even after a removed hint button and during bot turns, but
  must not consume Escape from an open native confirmation dialog.
- Compact phones retain at least 180 px for the board. Tablets use a responsive
  floor; preserve the 220 px short-laptop hint case with an unclipped heading.
  Comfortable regular boards scale with viewport height rather than staying at
  320 px. A focused view may be shorter than a scrolling large-mode board in
  absolute height while showing more of it alongside the rack on screen.
- Small-device practice flows on the page with a 260 px minimum table. Scroll
  lesson continuation controls into view when they appear and completion into
  view when finished. Preserve full instructions and lesson navigation.
- Game UI loads separately and is precached offline. Tests measuring the DOM must
  await the visible game view instead of immediately counting nodes after a
  navigation click. No arbitrary sleeps or weakened geometry checks.
- Expanded table minimum-size selectors must win over normal/comfortable floors,
  including short landscape screens. Check full melds, touch hit targets, hints,
  rotation, a penalty dialog, turn/reload persistence and scroll cleanup.

## Optional read aloud

- `ReadAloud` owns only browser speech, not game state. Every utterance requires
  Listen/Replay; never speak automatically after loading, selecting, or advancing.
  Retain written lesson copy and reminder text. Audio is separate from sound cues.
- Use the current UI language. `readingVoice` selects a matching Mandarin/English
  voice; never substitute Cantonese or the unrelated browser default. Prefer local
  voices, and exclude network voices while offline. Voice quality/availability
  belongs to the device: do not promise downloaded narration or offline speech
  without an installed voice. Empty/late voice lists must allow a gesture retry.
- Keep utterance identity guards: cancellation events can arrive after replay.
  Cancel owned speech on text/language change, unmount, tab hiding/page exit and
  closing the reminder's More menu. Stop returns focus to the playback button.
- Keep controls at least 44 px, full instructions and text fallback visible,
  and More within phone viewport bounds. Expanded-board geometry must still pass.
- Browser tests mock the speech adapter to verify text/language, cancellation,
  errors, replay and fallback; they do not prove audible output or pronunciation.
  Test first-use offline lessons with installed and network-only mock voices.
  Physical Apple voice playback/comprehension checks remain unverified.

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
