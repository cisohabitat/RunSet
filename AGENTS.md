# Contributor and agent guidance

Regular-game destination captions retain inline source numbers in the default
placed arrangement as well as organised views. Match placement feedback and
Table overview numbering; do not add card rows, shrink tiles or alter practice
captions. Crowded navigation coverage uses 50 table/50 rack tiles, 15 melds and
100 Undo snapshots. Preserve native 44 px targets, full focus visibility and
centre hit tests, 300/450 px expanded table-only floors, exact read-only saves,
deadline, all 106 IDs, actual group-15 placement, Undo and offline reload. The
latest unfinished edit and last accepted turn are distinct: Undo must return the
finder to the surviving accepted-play marker. Logical expiry is not physical
mobile suspension evidence. See docs/CROWDED_BOARD_REVIEW.md.

Phase 2 match evidence lives in docs/MATCH_REVIEW.md and docs/MATCH_AUDIT.json.
Keep historical scores integral, zero-sum and bounded by the full deck's 788
points, with nonnegative winner and nonpositive other scores. Completed saves
must agree with actual rack results; playing saves cannot have a unique match
champion already at target. Reject malformed imports through the existing notice
without replacing the current save. These checks establish coherence, not proof
of every historical move. Preserve the defensive tied-target continuation test.
The audit must finish all six ordinary-deal matches to unique champions, validate
original proposals before fallback and independently recompute every score.
Browser match journeys start with a constructed first-round finish, then play
fresh full rounds through native controls and real workers. Preserve quota retry,
draft export/reload/Undo/import, exact save bytes, stable literal names and
nonduplicated history. Logical clocks speed delays; they do not establish physical
device suspension behavior. Retain original CI job and offline shard limits.

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

Settings retains its header opener explicitly: Safari touch clicks may leave
focus elsewhere. Returning from a failed SimpleHome download must disable only
that optional view so full Home remains usable; preserve saves and other choices.
Do not reset the Simple preference for an unrelated Settings failure.

GitHub runner APT sources can use mirror+file entries. Include apt-mirrors.txt
and apt-security-mirrors.txt in the Azure-to-official-HTTPS rewrite; changing
only .list/.sources leaves those downloads on the slow HTTP mirror. Keep signed
verification, bounded retries and the complete browser/dependency install.
Native-dialog close may release inertness after effect cleanup in WebKit. Keep
one guarded next-frame focus retry only while the opener remains connected,
focus is still on body, and no other dialog is open. Never steal later focus.

MeldInspector is read-only regular-play help on the human turn. Keep its 64×88
preview tiles separate from compact/coarse main-board rules; joker values come
from inspectMeld and explanations from explainMeld. Footer content must not widen
shrink-wrapped tile cards or add a row. Preserve strict phone/iPad row counts,
>=44 px controls, modal scroll/close bounds, focus, selection and saves. Timed
turn replacement closes the old inspection. Long-run coverage must reach the
last tile while the close control remains hit-testable.

placementFeedback observes actual before/after physical tile locations within the
same human turn. Never acknowledge a request, no-op, rejected move or expired
turn as placement. Count newly relocated tiles only, not tiles already in the
destination. Keep feedback ephemeral and separate from lastPlaced and opening
progress. Preserve regular selection after rejection and existing teaching flows.
The selected-count control opens a neutral read-only preview, not a meld-validity
judgment; retain source joker values. Animation scans exclude dialog clones.

Keep the six comfortable-phone turn controls on one row using concise count
labels and bounded padding. Preserve >=48 px targets and >=300 px visible
expanded phone table space; retain the strict reading/board-space checks.

Production geometry coverage in e2e-compat/comfort-space.spec.ts retains the
comfortable-phone table floor across browser font metrics. Expanded rack padding
may shrink while leaving comfortable tiles and control dimensions unchanged.

The optional Settings caregiver guide reuses LanguageSwitch and existing
preference controls. Mount its language control only when expanded; retain native
details behavior and focus the real reading checkbox from its display shortcut.
Guide copy must use the actual translated control names. Never apply presets,
start a game, play audio or change an absolute deadline from opening the guide.
Test first offline Settings/Chinese use, selection/save preservation and reload.
Language-download errors must remain readable inside the open Settings guide;
expose the existing I18n error state rather than replacing or retrying a game.
Final release evidence is docs/INDEPENDENT_PLAY_RELEASE.md.

Track the tile-handling cycle in docs/TILE_HANDLING_ROADMAP.md. runset.rackOrder.v1
is a validated bounded display projection keyed by round seed, separate from game
saves/snapshots. Preserve all current physical IDs and append new ones. Regular
manual order survives Undo/Reset; automatic modes include future draws. Practice
ignores it. Arrangement drafts are keyed by seed/turn/seat/rack membership so a
stale panel cannot commit an obsolete rack. Keep native modal focus and Cancel.

CI browser suites run as separate matrix jobs after quality/benchmark checks.
Retain all suites, dependency/audio installation, HTTPS mirror fixes, twenty-minute
job limits, five-minute offline limit and unique failure artifacts. Acceptance
requires the complete exact-commit workflow, not only the quality job.
New-meld touch handling accounts for WebKit scrolling a focused button away before
its compatibility click. useTouchClick acts only after a completed tap on the original button,
filters movement/cancellation and suppresses a duplicate native touch click.
Retain normal mouse/keyboard behavior and the genuine touch cancellation test.
The existing CI check job is the aggregate of quality and every browser matrix
job; keep its name and require all dependencies, including failure/skipped cases.
Create the benchmark report directory explicitly in the quality job; it cannot
rely on a browser job having created test-results on a different runner.
Keep rack-order and placement announcement selectors distinct. UI tests that
read newly started games must await async persistence before dereferencing saves.

BoardFinder reads accepted physical edits from a new reducer Undo snapshot;
verify before/after seed, turn, seat and physical locations, including the
one-hundred-snapshot cap. Never treat a rejected request or Undo as a new edit.
Finders close More, reveal a hidden rack only when needed, scroll/focus one actual
tile and preserve selection, game bytes and deadlines. Exclude dialog clones.

WebKit can retarget pointer-up after native focus scrolling even with pointer
capture. Touch listeners therefore exist only for an active gesture on window,
filtered by pointer ID and removed on finish/cancel/drag/unmount. Mouse dragging
and keyboard remain native. Keep cancellation and one-action-per-tap coverage.
Home artwork uses shared non-interactive TileFace/TileArt; interactive Tile stays
in optional gameplay chunks. Preserve identical tile faces, colours and shapes.
After a handled touch, a native compatibility click can hit a newly exposed
control. Its separate bounded guard must survive the activating tile's unmount,
ignore keyboard/programmatic clicks, and clean up on the next pointer-down,
pagehide or its one-second deadline. Do not let a trailing click place selected
tiles unintentionally. Desktop drag start must not change selection visibility:
drop already chooses the dragged physical ID or its existing selection. Retain
the real selected/unselected drag, single-snapshot and Undo regression.

MoveHelp explains actual rejected attempts or current invalid drafts. Candidate
additions must pass inspectMeld and a hypothetical reducer move with empty
history; they are examples, never a claim the whole turn is complete. Preserve
physical IDs, selection, saves and deadlines. No help is inferred for a no-op.
Bot narration requires the actual completed bot actor and matching latest log;
read completed turnStart.table rather than the player's unfinished draft.

Whole-turn practice uses runset.turnPractice.v1, separate from regular saves,
short lessons and exercises. Replay a bounded whitelist of actions against the
known 106-tile practice fixture, then validSave; never hydrate arbitrary game
state, clocks or bot plans. Invalid End is checked without penalties; Draw is a
factual non-completion outcome. Gate completion on a real accepted engine turn.
Do not run an opponent callback or apply an automatic plan in practice. Preserve
selection/draft when showing steps, retain a read-only final table, and make
reduced prompts voluntary. Reach the full goal and controls through page flow
on desktop as well as phone/tablet. Error/feedback focus must bring the actual
message into view without locale/selection-driven refocusing. New captions use
existing device-speech fallback until exact recordings exist; no autoplay.

Final tile-handling release evidence is docs/TILE_HANDLING_RELEASE.md. Preserve
the connected handling-release journeys across main, compatibility and offline
suites. Full screen intentionally hides the header: use View → Standard before
Settings/language changes and restore Full screen afterward. Development-server
keyboard tests do not claim SW offline support; production browser journeys
verify first-use offline tools, Chinese, backup/delete/import/reload. Keep exact
regular-save comparisons, preference retention, physical IDs and strict visible
board/tile geometry. The Chinese move-help entry is neutral because accepted
unfinished drafts can also need explanation.

Track the learning/portability cycle in docs/LEARNING_PORTABILITY_ROADMAP.md.
Whole-turn lesson IDs are optional in v1 records for legacy opening compatibility.
Replay the correct known fixture; require the lesson objective before accepting
End turn, including exact joker replacement/reuse. Draw completes only its own
lesson. Selecting a new lesson must preserve the old draft until explicit Start,
with replacement scope visible. Keep practice independent of regular/short-lesson
saves, captions explicit and offline, and no automatic opponent/plan callbacks.

Whole-turn layout IDs are bounded 0–3; missing layout means legacy layout zero.
Rotate physical colour families bijectively across the complete fixture and keep
106 IDs conserved. Goal sets, clue IDs and translated colour words must transform
together; keep known solutions legal for every lesson/layout. Shuffle only fresh
practice racks deterministically. Next layout is explicit and starts a fresh
attempt; Restart repeats the current layout. Neither changes regular saves or
short-lesson progress; step visibility must retain selections and the layout.

Portable profiles use the strict versioned allowlist in src/lib/profile.ts. Never
import arbitrary localStorage keys, unsupported nested progress or reserved game
keys through profile values. Preserve the game-only backup contract. Profile
reads use pure validators, never loadGame. ProfileTools is lazy and precached;
keep its fixed Restore/Done footer reachable at >=48 px and readable on phones.

persistGame accepts optional validated profile values and an abort signal under
the existing serialized game lock/generation guard. A null game preserves the
regular save. Snapshot all affected raw keys before changes, attempt rollback on
failure, surface incomplete restoration honestly and reload only after success.
The Home-only import owns its cancellation controller; do not reload after
unmount. The explicit reload applies initial-read preferences/I18n without
synthetic storage events or stale App state. Retain actual timed deadlines.

Recovery comparisons are read-only and use actual validated state. Keep literal
player names literal even when they match dictionary keys. Describe unfinished
turn edits, original deadlines and practice lesson/layout/mode without inventing
history or skill ratings. Invalid display timestamps must show Unavailable, never
crash. Match profile practice-size validation to the real 65,536-character reader
limit. Distinguish unreadable device preferences from absent ones.

An existing game is excluded from profile restoration by default; replacement is
explicit. Game-only imports use Restore backup labels when preserveDeadline is
true; fresh-deal confirmations keep Start new game and fresh timer semantics.
Practice-restored context comes from the initial snapshot, never clears selection
or refocuses for locale/step-visibility changes, and clears on user play/restart.
Joker whole-turn goals allow valid extra group tiles once required replacement/
reuse is met; keep the full engine turn validator and required physical IDs.

Track the player-comfort cycle in docs/PLAYER_COMFORT_ROADMAP.md; publish and
fully CI-gate each phase. MoveHelp find actions close the modal before using the
existing board finder. Preserve selection, save and deadlines, exclude preview
clones and use real tile focus as the highlight. Candidate additions must pass
the hypothetical reducer; explain local repair separately from full-turn validity.

OpponentGuide reads actual bot levels from validated state, including mixed-level
imports. Keep player names literal, use audited current-turn capabilities, never
infer no legal move from a draw and distinguish pace from strategy. Its native
details live in More, with readable text and >=44/48 px summary targets; do not
add a permanent board row. Preserve worker redaction of other racks/log/history.
Fresh bot audits retain complete raw reports, source fingerprints and correlated
seed-block interpretation; no beginner difficulty changes without evidence.

TableOverview is a read-only optional native dialog in More. Derive summaries
from inspectMeld and public table tiles; use its represented joker numbers and
never invent values for an invalid meld. Choosing an entry closes the modal,
then uses the existing actual-tile finder without changing selection, hidden
rack state or saved bytes. Preserve >=48 px list/footer controls, scrolling,
Escape/opener focus, literal state and timer-driven stale-view cleanup. Keep
its CSS optional and retain strict expanded table floors on crowded fixtures.

Overview entries use two-line summaries and two columns on wider screens.
Translate standalone kind and points labels, not only compound board captions.
An empty imported draft meld has no first tile: keep it non-navigable. Check the
actual Chinese row for untranslated words and expire an open overview in tests.

Gentle-play feedback uses actual observed transitions. App's stable dispatch
boundary marks externally started/cleared game objects; suppress their cues even
when an imported completed game has the same seed as the active position.
GameOver receives an explicit fresh-celebration flag from App, never infers it
from a loaded finished state. Clear the flag on leaving game view. Keep static
winner/scoring content, twelve bounded particles and reduced-motion equivalents;
do not replay sounds or confetti for reopen/reload/import/cross-tab replacement.

Use the existing disabled primary buttons for concise Opponent turn / Please
wait labels. Keep human action labels, targets and expanded table floors intact.
SaveTools is lazy with its own Suspense fallback in both Home and Game menu;
never let its download suspend the entire header or playing board. Keep it in
the generated offline cache and preserve all storage guards and cancellation.
Recovery copy offers actions and honest save-failure handling without assuming
a network cause. State belongs outside the view recovery boundary.

The test-only ci-visual helper emits chunked JPEGs for selected bilingual
WebKit fixture views so reviewers can inspect them from CI logs without a local
workspace. Do not emit real user saves or credentials. Keep normal failure
artifacts, all browser suites, signed dependency installation, virtual audio,
twenty-minute job and five-minute offline limits. Audio mocks prove cue
selection/counts, not native voice quality or older-player comprehension.

Long gameplay notices must be keyboard-scrollable. Expanded comfortable-phone
status/notice regions retain full text in focusable scroll areas. The timed
toolbar must avoid a redundant second row: its visible View word may be clipped
only in expanded comfortable-phone view, retaining the native Table view label,
full saved/timer/expiry text and >=48 px selector. Keep the original rack-height
cap, whole 80 px tiles and 10 px top/bottom padding. Real bot notices must leave
>=300 px visible phone table space; retain the strict assertion and diagnostics.

Compatibility CI is split by the three existing project names, alongside
Chromium and offline jobs. Keep every project, full dependency/audio setup,
fail-fast=false, unique artifacts, and the aggregate check across the complete
matrix. Quoting RUNSET_COMPAT_PROJECT preserves the explicit project selection.
The View text span must inherit its label font in standard views; older generic
table-toolbar span rules must not shrink it.

Waiting action labels are information, so do not fade them with disabled-button
opacity. Keep the native buttons disabled, using neutral surfaces and normal
ink. Verify >=4.5:1 text contrast, full opacity, size and visible table space in
both themes; Axe does not enforce contrast on disabled controls.

Use the same 10 px top/bottom rack-tile padding and bounded focusable status/
notice spacing across comfortable expanded phone, tablet and desktop views.
Keep full 80 px tiles and the original rack-height cap. A populated timed bot
turn must retain the >=450 px tablet floor as well as the phone floor.

The connected player-comfort release journey spans interrupted timed drafts,
opponent guidance, table overview, move help, hidden-rack placement, an actual
accepted ending and downloaded-backup/delete/import/reload. Keep exact draft/
deadline/history comparisons, 106 unique physical IDs, preferences, real file
contents, native focus/hit targets, Axe and runtime-error checks. Await actual
persistence and cleared UI state before reloading or importing after deletion.

Result explanations use neutral factual labels rather than third-person prose
around a literal player name (You wins / played their last tile). Preserve name
placeholders literally, keep existing legacy translations and do not infer an
unrecorded ending. Update the existing dynamic translation and rule-summary
checks when changing this copy. Release evidence is docs/PLAYER_COMFORT_RELEASE.md.

Track the everyday-play cycle in docs/EVERYDAY_PLAY_ROADMAP.md. More groups
existing tools into labelled task sections without a new disclosure level or
permanent board row. Preserve control names, break/save behavior, keyboard/touch
reachability, read-only tools and all strict visible table floors. Phase gates
require the complete exact-main-commit workflow before the next phase.
Latest-play destination summaries deduplicate recorded physical IDs against the
completed public table, not the current draft. Explain valid patterns separately
from whole-turn acceptance; never invent bot intentions or intermediate moves.
Keep tile-by-tile navigation, explicit opener focus with a guarded WebKit retry,
first-use offline review and timer-driven unmount coverage.
Cache expensive pure game-derived validation by immutable GameState identity,
never by selection or the display clock. Reducer acceptance remains authoritative.
Retain crowded-session tests with 50 table/50 rack tiles, 100 initial snapshots,
Undo/Reset, exact deadline/save comparisons and offline reload. Timing samples
are browser smoke evidence; never claim battery life or physical Apple latency.
Contrast journeys that reload an expanded game must choose View → Standard
before using header Home. Waiting for a briefly rendered header creates a race
with the expanded-view hide effect. Preserve all contrast/geometry/save assertions.
A storage read exception is not evidence of malformed JSON. Preserve primary and
recovery bytes, increment the write generation and fail closed against an unseen
existing save. Reestablish expectedRaw only through a successful read; retain
queued-lock, abort, rollback/retry and bilingual first-use offline recovery tests.
App must distinguish loadGame.unreadable from an actual missing/deleted game.
Unreadable cross-tab/conflict results retain the live game and selection, show
Not saved/recovery guidance and do not claim that a remote position was loaded.
Bilingual static-copy checks include conditional alternatives and template literals
without interpolation. Retain all translated value/name placeholders; only the
English plural suffix {s} is intentionally absent in Chinese. Recovery notices
use >=16/18 px text and >=44/48 px dismiss targets, top alignment and keyboard
scrolling without changing tiles/deadlines. The connected release journey checks
a read-only all-destinations review after a real win before backup/delete/import.
Final everyday-play evidence is docs/EVERYDAY_PLAY_RELEASE.md. Keep the phase
history, failed-gate correction and measurement limits honest. Review modals must
set their own reading alignment rather than inherit centered result-screen text.

Track the position-confidence cycle in docs/POSITION_CONFIDENCE_ROADMAP.md and
CI-gate each published phase. Phase 4 physical/human checks remain paused.
PositionPractice is a temporary lazy modal, not a new stored game or profile key.
Copy only the current human's rack/public table and original opening/joker
snapshot. Never copy or reveal hidden allocations, clocks, scores, logs or Undo
history. Preserve all 106 IDs in a non-rendered holder; no artificial pool/counts,
draws or bot actions may appear as real. The reducer validates independent edits;
invalid Check has no penalty and accepted moves are never copied back.
Keep the original Game mounted, exact save/preferences/selection/deadline intact,
and close practice on real state replacement/expiry. Use distinct embedded IDs,
no duplicate main-content, explicit opener focus and a guarded WebKit retry.
Table arrangement projects public meld references only; never sort GameState.table
or any tile array in place. Preserve IDs/source numbers and stable ties. Invalid
and empty drafts stay first in organised views; use inspectMeld for real joker
values/colours. Keep numbered destination captions inline without new card rows
or smaller tiles. runset.tableOrder.v1 accepts placed/kind/colour only, defaults
to placed, changes on explicit selection and is independent of regular saves.
Include it in profile validation/labels and preserve it on deletion. Practice
ignores the regular table-order preference. Failed optional writes keep play
usable and show a notice; test actual placement, Undo, hidden rack, exact saves,
real expiry, native focus/targets and offline reload after sorting.
Profile choice labels for table order must reject inherited object keys as
Unavailable; never return arbitrary object properties to translated React text.

ResumeGuide is lazy and read-only on both Home variants. Reuse turnGuidance
rather than inventing separate legality or opening-point rules. Do not loadGame,
write storage, run a planner, expose hidden racks or restart clocks from the
summary. Home does not process timer ticks; continuing retains the original
deadline and processes expiry. Keep guidance >=16/18 px and SimpleHome primary
actions >=60 px. Include the lazy assets in offline precaching. Preserve literal
player names. Retain exact-save/deadline, first-use offline, both-home, actual
repair, real expiry and connected practice/arrangement/finish/backup journeys.
MeldTarget uses the same useTouchClick guard as tiles/new-meld creation. Preserve
normal-view Chinese comfortable-phone placement coverage: native focus scrolling
must not swallow the completed tap, duplicate it or retarget it to another meld.
Keyboard and mouse keep their native click path; never force browser test taps.
Home resume expiry copy differs from the short More/Take-a-break timer note.
Keep timed-break assertions scoped to the intended surface, preserving exact
deadline, single-expiry, restored-table and one-drawn-tile checks after copy edits.

Track the board/play refinement in docs/BOARD_PLAY_ROADMAP.md; fully CI-gate
all four separately published phases. GameLayout.css is optional gameplay CSS.
Keep draft explanations inside the tile-sized footprint like the existing footer;
retain the complete explanation and readable large/comfortable minima. Never
pack by changing DOM/engine order or shrinking tiles/targets. Check real bounds
rather than assuming browsers serialize CSS min() to pixels. Preserve long-run
access, source meld numbers, native placement/Undo, exact saves and offline use.

GameStates.css distinguishes safe destination dashes from solid keyboard focus
and selected-tile checks. Keep real native focus visible even on a suggested
control. Latest-play dots/descriptions stay engine-owned; do not replace them
with local selection or optimistic placement state. Preserve full repair text,
comfortable sizes, contrast palettes and exact game bytes while styling states.
Keep meld captions in normal case with normal spacing; decorative tracking
should not force extra lines. Comfortable error labels retain 16 px text.
Verify complete magnifier text and footer buttons against their actual card
bounds; inspect an original-size card close-up before inferring clipping from a
scaled full-screen screenshot. Preserve the full native Zoom/放大 label.
Magnifier labels use max-content width with a 44 px minimum; preserve the more
specific comfortable 60 px control. Keep the enlarged-label text-bounds stress
check: local font success does not establish CI/browser fallback-font fit.

Normal/Hard openingTilesFirst applies only once both openings reach 30; retain
point-seeking below 30, Easy and default rackPlan behavior. Alternate first-
extension rollouts preserve the legal greedy baseline, only improve tile count
and keep a <=20 ms slice inside the shared 240 ms work deadline. Validate every
extension, return a rack-empty finish early and preserve Hard partition search.
Keep the competing-group/run finish, five-versus-three opening, below-30,
zero-budget and hidden-allocation regressions. Benchmark balanced held-out
mixed/pair seatings before/after at the production budget, retaining raw reports
and fingerprints; never turn two correlated deals into a difficulty ranking.

Tile landing motion requires latestEdit's matching reducer snapshot and actual
physical relocation; do not animate initial lastPlaced values, Undo or Reset.
Keep the 160 ms/12 px bound, >=0.7 opacity, reduced-motion static equivalent,
dialog exclusion and owned resize/visibility/pagehide/preference/unmount cleanup.
Rejection decoration follows actual blockedMove plus active selection, retains
selection/checks/full engine reason and translates its accessible description.
Clear stale decoration on a new selection/drag/attempt; keep native focus distinct.
Fresh-only result motion retains App's eligibility, twelve particles and no
completed-import/reopen sound/celebration replay; its decorative mark is aria-hidden.
Keep the full motion/sound file in compatibility coverage. Preserve the strict
450 px tablet and 300 px phone board floors: the landscape-tablet status-padding
rule must beat existing inspector specificity without smaller text/tiles/targets.

Track the comfort/memory cycle in docs/COMFORT_MEMORY_ROADMAP.md and fully CI-gate
each phase. Recent-turn replay is a six-frame visit-only public projection, not
a save key or full-game event log. Copy only turn-start/completed public boards,
actor/turn and added public IDs; preserve literal names and reject gaps/invalid
boards. No hidden racks/pool, clocks, scores, inferred edit order or bot intent.
App replayEpoch increments on explicit start/clear replacements without remounting
ordinary play. Observe regular Game/results only, deduplicate StrictMode and clear
on cohort/visit replacement. Modal navigation never edits state or pauses clocks;
close stale dialogs and retain explicit opener/native focus with guarded retry.

Display theme uses the bounded runset.theme enum (system/light/dark), independent
of game saves and retained on deletion. useTheme resolves the device preference
before paint and subscribes to live changes with cleanup. CSS follows the
resolved root data-theme, including dark native controls/surfaces/high contrast;
do not reintroduce unconditional OS-only dark selectors that override explicit
Light. Preserve existing selector specificity and optional lazy Settings. Keep
the theme selector >=48 px, first-use offline coverage, denied-write notice,
profile allowlist/labels and inherited-key rejection. Theme changes must retain
real unfinished drafts, selected IDs, saved bytes and absolute deadlines.

Round history is optional local metadata in runset.roundHistory.v1, capped at 30.
Record only an observed playing→over public-turn transition in the same cohort,
never initial/reopened/imported completed games or temporary practice. Keep the
projection literal and factual: date, round, names, difficulty, engine scores;
no private tiles, game snapshots, inferred skills or lifetime claims. Decoder
bounds/validates and projects known fields; failed reads preserve unseen bytes.
Use its own optional Web Lock with reread/deduplication and a clear generation
guard. Failed optional storage must not block play. Delete game retains records;
confirmed Clear history touches only that key. Keep metadata explicitly excluded
from backups/profile restoration. Native lazy history dialogs retain >=48 px
controls, readable scrolling, Escape/opener and confirmation focus. Preserve the
connected actual-win/reload/download/delete/import/clear/offline journeys.

Fresh computer naming belongs at App.start's UI boundary through
nameFreshComputers, never a translator or engine migration. Chinese names retain
an explicit 电脑 prefix. Saved/imported participants and ongoing match rounds stay
literal on locale changes. Keep English engine defaults, typed humans, practice
characters and exact recorded lesson captions. Plain-copy changes preserve rule
terms and scope. Test three computers, actual replacement cancel/accept, restart,
locale switches, original timed imports/reload and first-use offline behavior.
Computer-turn rack tiles remain disabled, but their scrolling parent must be
keyboard-focusable with a translated waiting label. Retain the fixed computer-
first seed and fixed Date (with browser timers running), native arrow-scroll and complete Axe check;
never disable the accessibility rule to hide this regression. Final cycle
evidence is docs/COMFORT_MEMORY_RELEASE.md; verify full exact-commit CI and live
checks before final handoff, retaining the paused physical/human-study limits.

Track everyday polish/confidence in docs/POLISH_CONFIDENCE_ROADMAP.md and fully
CI-gate each phase before beginning the next. Settings selectors share >=48 px
controls and theme tokens; labels may wrap inside the scrolling dialog rather
than truncate a long selected choice. Await lazy dialog visibility and exact
control count before enumeration in tests. Tablet waiting dots reserve title
space without stealing metadata width; preserve the existing ellipsis, reading
sizes, coarse-pointer scope and strict table floors. Count distinct text-line y
positions, not raw Range rectangles for separate React text nodes. Keep first-use
offline screen review and exact-save comparisons.

SimpleHome's lazy ResumeGuide can shift More options after its first layout.
Round-history journeys must await visible SimpleHome and, when Continue game is
present, the real resume context before scrolling/hit-testing More options.
Completed games have no resume context. Retain strict target geometry; never
replace this readiness wait with a sleep or force click.

Regular turn-stage labels read the existing cached turnCheck plus actual dirty
comparison; never store a second game status or infer acceptance from placement.
Keep start/draw-or-pass, invalid draft, valid rearrangement without a rack tile,
ready draft and waiting distinct. Preserve original opening/played counts and
show full engine reasons for invalid public-only drafts too. Group the label and
copy in the existing bounded status row, with reduced-motion/static equivalence;
no new board row, automatic commit or clock pause. Practice keeps lesson wording.
Retain real placement/penalty-cancel/Reset/Undo/accepted-handoff/expiry journeys
and strict 300 px phone / 450 px comfortable-tablet expanded table floors.

History browsing uses roundHistoryView's copied newest-first projection. Match a
mixed-level round once if any computer has the selected level; explain this and
separate retained totals from shown-record/win counts. No lifetime or strength
inference. Filter state is panel-only, reset on open/confirmed clear, excluded
from saves/profiles and never written to history. Native per-round details retain
literal names and real signed scores, >=48 px summaries/selectors, scroll/focus
and independent clearing. Existing history journeys must expand details and await
the visible score list, not validate text hidden inside a closed disclosure.

The history footer uses native Clear records text as its accessible name. Do not
retain an aria-label containing different older wording after shortening visible
copy; preserve label-in-name for speech navigation. Keep confirmation's separate
Clear history action and existing independent clear scope.

History Clear confirms all recorded rounds, including those hidden by the active
filter. Never imply only shown records are removed when deleting the whole key.
Retain the filtered-clear test proving all history is removed while exact game
and preference bytes are kept.

History CI caught fallback-font wrapping in both phone languages. Keep compact
date-only summaries with the complete timestamp in expanded details, and footer
buttons with max-content flex bases rather than equal narrow columns. Preserve
the <=80 px fixture summary and <=64 px footer checks, >=48 px controls and the
fallback-font/letter-spacing stress journey; do not loosen geometry thresholds.

Offline.tsx is an eager wrapper with independent Suspense and RecoveryBoundary;
OfflinePanel is optional and precached. A failed tools chunk must leave Home and
the real game usable. Keep Check for updates read-only: use native registration
update, distinguish offline/unavailable/failure/downloading/no-new-version, and
never send SKIP_WAITING or reload during checking. Native visible labels remain
accessible names, >=48 px controls and >=16/18 px copy. The panel is a labelled
region, not a complementary landmark nested inside game-menu navigation. Keep
its landmark when outside main on lesson/Home screens; a group alone fails that
page-level accessibility requirement. Retain both nested-menu and full-page Axe.

Manual checks retain per-mount request identity and ignore completion after
unmount; prevent concurrent check/accept actions. Preserve explicit acceptance,
save-before-activation AND save-before-reload, activation watchdog/listener
cleanup and fail-closed storage. Keep real worker discovery through the Check
button in recovery tests, quota-failure retry and the move-during-activation
regression. The connected bilingual update journey checks actual native update,
zero activation/navigation, failure, pending unmount, exact draft/preferences,
original deadline, offline reload and real Undo. Seed existing view preferences
before taking an all-keys baseline; do not hide first-use initialization by
dropping keys from comparisons. Preserve all browser jobs and offline timeout.

Do not run local native-update compatibility checks alongside offline suites that
rewrite dist/sw.js. Preview ports share the same build directory: a staged
recovery worker can correctly appear as a new version in another suite. Run
those suites sequentially (or use truly separate builds), keep the no-new-version
assertion, and retain CI's separate checkouts for each browser job.

Track the everyday-quality cycle in docs/EVERYDAY_QUALITY_ROADMAP.md. Phase 1
audits the READY production revision through actual update-check, complete lesson,
interrupted-draft/finish/backup-recovery and visual journeys, in both languages
across phone/tablet/desktop browsers. Record the deployment SHA and exact CI;
separate live acceptance from local staged-worker tests and paused human/device
studies. Publish and fully CI-gate each phase before implementing the next.

Home's rules entry belongs to its hero (full Home) or existing More options
(SimpleHome); omit the duplicate footer rules action on Home and the self-link
on rules itself, which could overwrite helpBack with help. Retain the footer
shortcut elsewhere. Restart game still uses settingsForGame and explicit
replacement confirmation; keep legacy translation entries. Practice · keep this
game routes to independent lessons without replacing the regular save. Menu
Settings remains necessary when comfortable-phone overlays cover the header.
Keep safer practice first, explicit Delete saved game last, >=48 px menu controls,
16/18 px text and menu-only scrolling. Reopening resets the menu's own scroll
without changing focus or game state; nested disclosure toggles must not reset it.
For native file controls, measure the visible .file-button label that forwards
clicks, not the transparent input's smaller border-interior box or unused font.
Keep the same full target/text assertions and test every accessible menu button.
When removing a duplicate navigation control, update the older full accessibility
journey to the retained native action. Its rules visit must use How to play on
Home, not a footer-container button that no longer exists. Keep all four
language/theme audits and every original Axe/keyboard/reflow assertion intact.

Rule diagrams use canonical physical IDs in src/lib/ruleExamples.ts. Submit those
same opening and joker sequences to the real reducer in tests; keep below-30
rejection, represented joker values and 106-ID save validity. Do not create a
temporary game in the actual rules screen. Native example disclosures are
visit-only/read-only, >=48 px, with 16/18 px copy and full-width diagrams. Their
comfortable caption selector must beat the later global 16 px supporting-caption
rule. Test actual visible figures, offline first visits, rotation, Axe and exact
regular-save bytes, without changing recorded lesson captions or auto-playing
speech. Compatibility projects verify new examples after disconnecting; preserve
the full offline suite's existing cases and five-minute per-shard cap rather than adding
duplicate long journeys near its limit.

The offline suite outgrew one five-minute step: all70 cases passed at5.0 minutes,
but runner teardown crossed its watchdog. CI now adds offline-2 alongside the
original offline matrix entry, invoking Playwright shards1/2 and2/2 respectively.
Each has an independent checkout/build, one worker, a five-minute test step,
twenty-minute job and unique failure artifacts. Preserve the other four browser
projects, full install/audio/HTTPS setup and aggregate check across the complete
matrix. Both shards are required; neither alone proves full offline acceptance.
Use --list to verify shard sets are disjoint and their union equals the entire
suite. Run local shards sequentially against a shared dist directory, since the
real-worker fixtures rewrite dist/sw.js; CI's separate job filesystems may run
them in parallel. Never omit cases or raise timeouts to mask this capacity issue.

Difficulty-review diagnostics validate the separate same-input Normal baseline
before counting a known opening or finish; retain its input-immutability and
original-plan rejection checks. Keep baseline work outside measured actual-plan
latency. Per-round plays/draws/passes and accepted rack tiles must reconcile with
personal turn counts and 14 + draws - tilesPlayed = remaining rack size. Export
raw host/load, fingerprints and bounded redacted counterexamples. A zero missed
finish count with zero known finish opportunities provides no finish-coverage
evidence. Preserve the default and strategies unless a demonstrated defect or
separately justified change warrants implementation; never tune to sampled wins.

Extended-session tests seed 100 valid copied Undo snapshots, then drive real
tile targets against an independent reducer expectation. Preserve exact saved
state, 106 IDs, the 100-snapshot bound, selected-tile rotation and original timed
deadline. Failed primary writes must leave previous bytes and the live edit;
restore storage and retry through Take a break, then reload and actually Undo.
The timed Home break is logical elapsed time, not physical mobile suspension;
verify exactly one expiry draw, restored turn-start table/rack and cleared Undo.
Keep bot pace bounded away from the immediate expiry assertion, then leave play.
Untimed runs import three valid playing fixtures through real backup confirmation
and actually finish each round before checking independent round-history counts.
Never seed completed games as a substitute. Chromium retained heap/DOM samples
compare the same editing arrangement after GC, with Undo already at its cap;
keep 8 MiB/150-node growth smoke bounds, raw samples and explicit host limits.
Native Chromium frozen/active coverage is separate from logical Home time and
is not claimed for WebKit/Firefox. Preserve all existing offline cases; production
compatibility tests cover these additional long offline journeys instead of
duplicating them in the five-minute offline shards.

The regular table's decorative topline scrolls normally. A sticky topline could
cover the first meld destination's click point after Firefox native scrolling
from a lower selected tile. Keep the direct regular-game selector static,
preserving practice scope, expanded visibility, all target sizes and table floors.
Retain the extended journey's original centre hit test; do not force clicks,
reposition destinations in the test or lower geometry requirements to bypass it.

Session evidence and reproduction live in docs/EVERYDAY_SESSION_REVIEW.md and
docs/EVERYDAY_SESSION_SAMPLES.json. The optional playwright.session.config.ts
reuses the production preview/connected compatibility flow for Chromium heap
evidence; it supplements the complete required CI matrix. Distinguish main dev
measurements from built production, renderer heap from process memory, and
finite bounded growth from proof of indefinite leak freedom. Do not infer
physical-device behavior from those reports.

Persisted game bytes can precede Saved feedback and the final native layout after
reload/Undo. Extended-session checkpoints await both the exact save and visible
Saved indicator when the game is mounted. After native scroll, poll the original
full target-size/viewport/centre-hit conditions with detailed geometry. Keep the
existing assertion timeout and a measurement-only poll; no repeated scrolling,
forced clicks, repositioning or lowered bounds to hide permanent obstruction.

Keep More's 12 px block scroll margin. Native Chromium nearest scrolling can
round to a whole page offset while leaving the summary's fractional bottom just
outside the viewport under fallback fonts (667.40625 vs667). Waiting alone does
not correct this. The margin preserves the whole target without smaller controls
or epsilon tolerances. Chinese untimed extended tests apply DejaVu/Noto fallback
metrics on every reload, outside the one-time save seeding guard; retain that
reproduction across main and compatibility projects.

Track the gameplay-depth cycle in docs/GAMEPLAY_DEPTH_ROADMAP.md and fully
CI-gate each phase before the next. Diagnose blocked endings with validated
literal witnesses; neither a pass nor a failed bounded search proves no legal
move exists. Hard's localRepair operates on its legal baseline, retaining every
already-played rack tile and all public tiles. Limit it to eight remaining rack
tiles, 35 ms shared local work and at most 6 ms per relevant meld, all inside the
unchanged 240 ms overall work cap. Keep the best validated plan on timeout and
check complete turn legality including joker obligations before accepting any
candidate. Fresh meld IDs must avoid every retained ID. Preserve Easy/Normal,
zero-budget fallback and hidden-allocation independence. Separate discovery
seeds/fixtures from held-out verification, and label frozen-position comparisons
accurately: they do not establish changed full-round results or win rates.
Compare local candidates against the same fixed legal baseline, trying smaller
melds first. Do not greedily commit an early partial repair before checking a
later rack-empty candidate; the reversed crowded fixture guards that regression.
The audit must reject unmet tactical objectives before simulating its longer
seed block. A complete report requires those controls as well as legal plans.
Try the inexpensive single-public-tile/two-rack-tile transfer before generic
enumeration, with at most 10 ms from the same 35 ms local cap. The cold combined
extension/borrow control must still finish; do not relax that objective or raise
the six-millisecond generic slice to hide it. `--recheck` verifies every known
Hard witness from a complete versioned audit, reconstructing unseen inventories
solely for conservation and redacting them before planning. Preserve the input
audit hash, original source fingerprints and explicit frozen-position scope.
