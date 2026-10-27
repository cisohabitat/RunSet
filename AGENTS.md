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
- The older Chinese-speaking player study and physical-device checks (older-player
  roadmap Phase 1; premium Phase 8) are paused by the user. Do not block automated
  implementation on that study or claim it ran.

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
- Standard phones at most 740 px tall use concise, fully translated guidance,
  a 44 px labelled dismiss control and a toolbar countdown while coached.
  Keep match scores/round accessible in More; restore normal information when
  coaching is dismissed. Preserve full text for larger/comfortable views and
  read-aloud reminders. Check the visible paragraph with match, timer and a
  selected tile together; an element merely existing is insufficient.
- Compact timers must retain the expiry action (draw/pass), including an empty
  pool, with the reset explanation available through `aria-description`. Do not
  shorten a timer to seconds alone when replacing the normal clock's guidance.
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
  and optional guidance cannot scroll the View selector out of reach.
  Test toolbar bounds against the game workspace, not the optional context.
- `runset.tableExpanded` is an optional regular-game view preference. Preserve it
  across turn remounts and reloads, and keep it through game deletion. Practice
  must not inherit or overwrite it. View changes do not change tiles or saves.
- Expanded view fills the viewport with the rack shown by default and primary
  controls always available.
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

## Temporary rack hiding

- The native View selector offers Standard, Full screen and Table only with a
  >=44 px target and `aria-controls` for table/rack. Its value exposes the active
  view. Use native `hidden` on the rack section, so
  hidden tiles leave the accessibility tree and tab order. Preserve selection,
  draft, deadline and save; hiding is a view change, not an engine action.
- Rack hiding is temporary component state: reset on leaving Expanded table,
  turn remount and reload. Only the existing expanded preference is stored.
  Practice must ignore that preference and keep its rack available.
- Keep the View selector visible on phones while hiding secondary table-navigation
  controls. Use a concise visible countdown but retain its timer accessible
  label; keep save/error text and controls in bounds in both reading modes.
- Test real placement, Undo and hints while hidden; restoring selection on Show;
  automatic restoration after Draw, exit and reload; and native-dialog Escape
  separately from the next Escape that exits Expanded table. Preserve body-scroll
  cleanup and focus restoration. Check measured visible table gains, not just
  element height, and verify first-use controls offline.
  After gameplay actions, await the actual saved state before capturing a
  storage-invariance baseline; rendered Undo results can precede async saving.

## Phone tile density

- Standard regular-game phone touch tiles are 44×54 px with 25 px numbers. Retain
  >=44 px tap width; reduce surrounding gaps/padding instead of shrinking that
  width. Destination/action controls retain their targets. The 14 px corner check
  is visual only and must not cover the number or replace the selection outline.
  Rack padding must contain the raised tile plus its full outline/offset; verify
  the outline against the scrolling rack's clip bounds before reducing padding.
- Scope to coarse-pointer views <=720 px wide or short landscape views <960 px
  wide and <=520 px high. Preserve iPad's 44×60 layout, practice and mouse-only
  layouts. Respect larger-touch (54×74 phone) and comfortable-reading (58×80)
  preferences; never overwrite stored choices to enable density.
- Check 360×640, 375×667, 390×844, 430×932 and 844×390 in both languages. Include
  selected two-digit tiles and jokers, actual touch placement/Undo, rotation and
  exact-save preservation, 50 rack tiles and changing larger display preferences.
- Measure populated fixtures honestly: some phones gain a full rack tile, while
  others retain the same count with tighter spacing. Record physical-device and
  older-player readability limits separately from Chromium viewport checks.

## Landscape tablet density

- At 960–1440 px width, height >=600 px, landscape and `any-pointer: coarse`,
  standard regular play uses 44×60 px tiles, tighter meld padding/gaps and a
  52 px header. Preserve >=44 px hit targets and readable numbers/shape marks.
- Respect explicit larger-tile and comfortable-reading preferences. Comfortable
  tiles remain 58×80 px; do not apply compact tablet rules to practice, phones,
  portrait layouts or mouse-only desktops.
- Share horizontal space for scores/timer and opponents/guidance. Keep complete
  instructions, long names and three-opponent bounds. Live hint controls must
  remain hit-testable; context cannot overlap the table/rack/actions.
- Keep expanded workspace safe-area padding: compact outer game padding applies
  only to non-expanded view. Rotation must preserve selection, deadlines and save.
- Check one-row density with populated six-meld fixtures at 1024×768, 1180×820 and
  1366×1024 in both languages; include larger preferences and 50 rack tiles.
  Disable entrance animations with reduced-motion emulation before exact tile
  geometry checks, including separately created mouse-only browser contexts.

## Optional read aloud

- `ReadAloud` owns device speech or bundled narration, not game state. Playback requires
  Listen/Replay; never speak automatically after loading, selecting, or advancing.
  Retain written lesson copy and reminder text. Audio is separate from sound cues.
- Use the current UI language. `readingVoice` selects a matching Mandarin/English
  voice; never substitute Cantonese or the unrelated browser default. Prefer local
  voices, and exclude network voices while offline. Voice quality/availability
  belongs to the device for device speech; offline device speech requires an
  installed voice. Bundled recordings work offline after verified precaching. Empty/late voice lists must allow a gesture retry.
- Keep utterance identity guards: cancellation events can arrive after replay.
  Keep delivery warm and lighthearted: modest pitch (1.06) and unhurried pace
  (0.92). Avoid exaggerated pitch or fast speech for older learners. Browser
  prosody cannot guarantee emotional acting; do not describe it as recorded audio.
  Cancel owned speech on text/language change, unmount, tab hiding/page exit and
  closing the reminder's More menu. Stop returns focus to the playback button.
- Keep controls at least 44 px, full instructions and text fallback visible,
  and More within phone viewport bounds. Expanded-board geometry must still pass.
- Browser tests mock the speech adapter to verify text/language, cancellation,
  errors, replay and fallback; they do not prove audible output or pronunciation.
  Test first-use offline lessons with installed and network-only mock voices.
  Physical Apple voice playback/comprehension checks remain unverified.

## Difficulty evaluation

- `scripts/review-difficulty.mjs` evaluates production strategy without changing
  it. Use all six ordered mixed seats and both orders for every head-to-head pair,
  the production 380 ms budget, and record engine fingerprints and the timing host.
- Check original submitted plans before reducer fallback. A rejected joker plan
  can become a safe draw/pass while the completed table remains legal; report
  proposal rejections separately and preserve examples. Count passes separately.
- Redact hidden racks/log/history as the worker does. Keep per-round seed/seating,
  endings/ties, actual accepted tiles, opening opportunities and raw latency
  percentiles. Compare Hard and Normal from the same positions when useful.
- Checkpoint reports are incomplete until every requested assignment finishes.
  Seat permutations of one deal are correlated; do not claim independent samples
  or infer human enjoyment. The old six-round pilot is not a strength ranking.
- Do not call Hard a lookahead/minimax player: it searches current-turn partitions.
  Fix planner rule compliance before tuning win-rate heuristics, and evaluate
  changes on separate held-out deals rather than optimizing the review's seeds.
- Bot extensions must pass the complete turn validator before becoming the
  baseline. Hard filters partitions during search, so rejecting a joker plan
  cannot hide a legal alternative. Stop at a legal rack-empty finish. Reserve
  runtime headroom with the shared 240 ms work cap inside the requested budget;
  measure the full call separately and report the host and sample limitations.
- Track the completed premium cycle in `docs/PREMIUM_ROADMAP.md`. Publish and verify
  each phase before starting the next. The physical-device/older-player phase
  remains paused; automated tests cannot substitute for those sessions.

## Working and verification

- Latest-play marks come only from `lastPlaced`, separate from hints and local
  selection. Keep joker labels unobstructed. Destination animations are optional,
  bounded to visible tiles and cancelled on resize/unmount; reduced motion keeps
  the same static information without JavaScript animation.
- Prime optional audio from real pointer/key gestures. Use `transitionCue` on
  actual before/after states; do not play success just because an action was
  dispatched. Muting, view changes and reopening completed results must not
  replay cues. Do not queue audio in suspended or hidden contexts.

- Shared visual foundations live in `src/theme.css`: reuse its font, palette,
  control border, focus, spacing, radius and shadow tokens. Keep decorative
  separators separate from interactive boundaries. Do not merge device tile
  dimensions into the theme or flatten deliberate reading/touch overrides.
- Maintain at least 3:1 form-boundary/focus contrast against surrounding surfaces
  and 4.5:1 tile-text contrast. Native/system fonts must work offline in both
  languages; no unbundled font dependency is assumed. Keep tabular tile numbers.
- Phone toolbars keep the View selector and omit secondary table-start/end
  buttons to avoid wrapping. Place/Dismiss hint actions must stay reachable
  while the explanation scrolls. Keep full hint text in Why this works, and
  check a deterministic ten-tile opening rather than relying on timed search
  to generate the longest caption. Do not loosen geometry to hide clipping.

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
- CI keeps Playwright's complete dependency installation. Its Ubuntu sources
  use the official HTTPS archive mirror with bounded download retries/timeouts;
  Azure's HTTP mirror repeatedly stalled on font/system packages. Preserve
  signed package verification and browser/offline coverage when changing setup.
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

New setup defaults are one Easy opponent, no timer, one round and guidance on.
Custom choices use More game options; editing an existing game's settings opens
it automatically. Preserve saved choices and typed names; empty names use the
UI locale's You/你 fallback. Returning Home prioritizes Continue/View results.

Keep `README.md` aligned with implemented behavior, tooling, commands, storage
limitations, and deployment setup. Update this file when conventions change.
Summarize changes and verification results. Commit, push, or deploy only when
requested; configuring Vercel is distinct from a successful live deployment.

Focused exercises use `src/engine/exercises.ts` and `runset.exercises.v1`. Keep
objectives and clues tied to real tile IDs and full-turn legality. Check never
ends a turn or applies penalties. Preserve regular saves, normal lesson progress,
page-flow instructions, explicit completion and restart selection cleanup.

Recorded guidance uses exact caption/locale matches in `src/lib/narration.json`.
Changed copy must fall back to device speech until recordings are regenerated
and reviewed. No autoplay: cancel owned media on locale/source/screen/menu/tab
changes. Preserve the device option, visible text and `runset.audioVoice` across
delete. Audio assets belong in the offline cache; test actual first-use offline
playback without Web Speech. Automated decoding cannot approve pronunciation.

Numbered exercises accept integer codes 1–999999 and preserve legacy fixture
4321. Transform goals, clues and every physical/snapshot ID together; verify
seeded solutions through the real reducer and validSave. Different numbers may
share a visible layout. `runset.solo.v1` is independent bounded local progress,
with deterministic cross-tab merging and no streak requirement. Preserve both
exercise keys when deleting regular games. Keep paused human checks explicitly
untested in `docs/PREMIUM_ACCEPTANCE.md`; automated playback cannot approve tone.

The completed quality cycle is `docs/QUALITY_ROADMAP.md`: difficulty audit, then
accessibility, then performance/recovery. Gate every phase on exact-commit CI.
Benchmark smoke must validate original proposals before reducer fallback and
count empty-pool passes separately. Report seed blocks, not independent seat
rounds, when comparing difficulty; retain raw reports and engine fingerprints.

CI cancels superseded runs on the same ref, bounds the job to twenty minutes
and the offline step to five. These limits follow an observed stuck runner;
keep all browser/offline/benchmark checks and failure artifacts intact.

Accessibility audit coverage lives in `e2e/accessibility.spec.ts`, with dev-only
Axe scans and actual keyboard/reflow flows. Keep one `main-content` landmark per
screen and use named sections for embedded Game boards. Route focus must wait
for lazy content, preserve native-dialog ownership and avoid locale/timer-driven
refocusing. Teaching steps focus new objectives (or their described continuation action)
after board keyboard work;
regular play retains rack focus. Keep invalid/rules text at >=4.5:1 contrast and
the Skip to content link usable without changing tile sizes or saved state.

Keep phone lesson continuation buttons fully visible when they appear. Heading
focus must not undo that scrolling. Quick-exercise start, success and chooser
transitions focus their matching heading; never refocus for locale/selection.

Recovery keeps App-owned state outside the error boundary. Save the latest game
before reload and recheck after worker activation; rejected locks and failed
writes must resolve visibly without losing the old save. Cancel pending recovery
reloads on unmount, suppress stale bot callbacks and state that timers continue.
Offline activation retains a previous cache containing index.html, ignoring empty
failed installs. Clean up owned listeners/watchdogs and preserve explicit update
consent. Run the full production offline suite after worker changes.

Crowded-board timing coverage uses 50 table/50 rack tiles and 100 Undo snapshots
under 4× Chromium throttling. Retain raw samples and distinguish mouse baselines
from coarse-pointer verification; do not describe them as physical Apple results.
Keep memoized Tile callbacks stable while preserving context-driven translations.
The recovery report is docs/QUALITY_RECOVERY.md; long-session coverage is the
1000-turn engine soak with ten validated backup round trips.

The confidence/enjoyment cycle is docs/ENJOYMENT_ROADMAP.md, with six
separately published CI-gated phases. Turn reminders must count seats before the
human, preserve literal names and read completed actions from public engine logs.
Keep on-demand help accessible after coaching is dismissed, without reducing
the meld area or introducing automatic narration.

HintPreview must validate a hypothetical applyPlan through the reducer, preserve
the live draft/save/history on open/close and restore modal opener focus. Never
reuse live tile DOM IDs in the preview. State/timer changes invalidate previews;
only explicit Place hint may apply the plan, and End turn stays separate.

Difficulty advice must match audited capabilities after opening: Easy new melds,
Normal extensions, Hard additional repartition search. Preserve one-Easy/no-timer
defaults and typed setup options. Changing a setup choice never mutates a saved
game. Do not imply deterministic wins or hidden-rack access.

Result takeaways may use final rack facts (empty rack, retained joker, unopened
player, highest number), never invent missed moves or a play history. Scoring
bars show rack totals, not positive/negative score magnitude; visible text and
accessible meter values must agree with engine results and literal player names.

Daily practice uses the device's local calendar date and deterministic bounded
puzzle numbers. Refresh the offer on visibility/date changes without replacing
a session, selection or regular save. Persist the chosen date only when kind/code
match its generator. Clues reveal rules, tiles, then the current step; all moves
and completion stay explicit and engine-validated. Do not add streak pressure.

LoadingScreen keeps main-content, a heading and an announced status while lazy
views download. Route focus must skip busy/hidden previous Suspense content and
wait for a rendered heading; completed rounds use a distinct results focus key.
Preserve native-dialog focus and the regular-game rack handoff. At 320 CSS px,
comfortable setup fieldsets must shrink and opponent choices wrap without smaller
text or hit targets. Final journey coverage lives in e2e/release-journey.spec.ts;
release evidence and live-deployment limits are in docs/ENJOYMENT_RELEASE.md.

Playing/results Suspense boundaries have separate keys so a slow results download
cannot retain a hidden board with a second main-content ID or body-scroll lock.
Keep App-owned game/save state outside both boundaries.

The completed reliability cycle is docs/RELIABILITY_ROADMAP.md. Run test:compat for cross-browser
player flows; preserve the existing Chromium suite. WebKit Linux emulation is
not physical iOS. CI installs supported browser dependencies normally. Local
non-root library overrides stay outside the repo and must not be required in CI.

RecordedGuide has a ten-second startup watchdog, cleared by playing/cancel and
identity-guarded against stale callbacks. Network-failure media tests block SWs;
keep separate real offline-playback tests. Headless Firefox needs a virtual sink
for genuine decoding/playback; this does not verify voice tone or pronunciation.

MoveReview reads latest IDs from the completed snapshot (turnStart.table while
playing, final table when over), never the current draft. Do not infer an edit
order or source choices that were not recorded. Missing placement data produces
no review. Preserve modal focus, selection, saves and timer semantics.

Practice suggestions use only validated final-rack facts and completed kinds,
never an inferred skill rating. Prioritize an unopened final rack before joker
practice. Offer suggestions only without an active exercise draft; starting and
checking remain explicit. Read regular saves without changing storage write guards.

runset.contrast is an independent optional preference. Apply its palette at the
document root so dialogs and recovery inherit it, without remounting play. Keep
colour families/shape marks, physical tile sizes, focus and saves intact. Verify
both themes/languages, comfortable reading and short landscape phone targets.

Break navigation must await saveLatestGame and leave the table usable on failure.
Game owns and aborts the pending navigation signal on unmount: a late save must
not pull players out of another screen. Preserve draft/history and existing
absolute-deadline semantics; Home does not claim timed play is paused. The 5000 ms
pace is an independent preference, retained on delete, never an engine rule.

Track the independent-play cycle in docs/INDEPENDENT_PLAY_ROADMAP.md and keep its
physical/human phase paused. runset.simpleHome is independent of reading, contrast,
learning and game saves. SimpleHome is optional/lazy/precached; keep main choices
>=60 px high even under comfortable-reading selectors. More options retains
rules, practice, deletion and backup tools. Shared SaveSummary must retain draft
and absolute-deadline context in both home views. Home Suspense keys differ by
view to avoid duplicate hidden landmarks. usePreference preserves default-on
learning/narration and the muted=true fallback when storage reads fail.
