# Visual clarity and easier play

Baseline: f6e1288, complete CI 40995269203 passed (223 units / 849 browser
cases), matching READY production and eight passing bilingual live checks in
40995383142. Multiplayer and physical Apple/older-player/native Mandarin studies
remain deferred or paused as previously agreed.

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Fresh phone, iPad landscape and desktop visual review; fix demonstrated layout issues | Complete: 5d7cf80, CI 41001914360 and eight matching live checks in 41002020602 passed |
| 2 | Returning-player clarity: turn ownership, unfinished moves and finding help | Complete: fd2c185, CI 41050591499 and 24 matching live checks in 41050800697 passed |
| 3 | Chinese learning instructions, hint explanations and mistake recovery | Implemented; exact-commit full CI and matching live acceptance required |
| 4 | Reconcile historical roadmap statuses and consolidate release evidence | Planned |

Publish each phase separately, update README and AGENTS, then require all twelve
CI jobs and matching production/live acceptance before the next phase. Preserve
100000-byte initial gzip budget, native touch targets, tile dimensions, meld-area
floors, saves, learning isolation and bot budgets.

## Phase 1: demonstrated issue

The existing screen review passed while a scrolled Settings screenshot showed
neither its heading nor its top Done action. Both were part of the long dialog's
scrolling content. The bottom Done action remained available after further
scrolling, but intermediate controls lacked a visible immediate exit.

A regression scrolling natively to Opponent pace fails on the original layout:
the top exit and heading leave the dialog/viewport and the exit cannot be hit.
Settings now has a fixed flex header and a separate scrollable body. Its title
and 48 px minimum Done target stay visible; the option area retains native
scrolling and focus-outline clearance. This avoids placing a sticky overlay
above controls. The lower Done button, Escape, opener focus restoration, optional
setup guide, timer behavior and all preference logic are retained.

## Review and verification scope

Fresh screenshots cover Home, setup, rules, learning, exercises, board and
Settings in English/light and Chinese/dark at 375×667, 1180×820 and 1440×900.
These are constructed saved positions for layout review, not complete random
rounds or physical-device sessions. No other demonstrated defect in those
captures justifies changing board density or typography.

The existing visual-consistency journeys additionally exercise Settings at
320×640, 1180×820 and 1440×900 in standard and comfortable reading. They retain
all original screen, bounds, accessibility, preference and exact-game-save
assertions, plus native control scrolling, visible/hittable exit geometry and
expanded setup-guide coverage. They run in main Chromium, all three production
compatibility profiles and the existing offline shards. Case counts and time
limits remain unchanged. The connected release journey also checks the scrolled
Settings header, then actually closes it and verifies opener focus and saved
progress, including against matching live production.

Local original-layout failure: /tmp/runset-settings-before.log (temporary).
Local production build: 99259 initial gzip bytes, 77 precached files. Full CI
and matching live acceptance on the published commit remain the release gate.

Local acceptance passed 223 units, 11 existing reading/settings flows, six fresh
multi-screen visual journeys and both Firefox production visual journeys. Local
WebKit could not launch because host libraries were missing; the required CI
matrix installs its complete standard dependencies and must provide that result.

Initial publication f8ce252 passed all eight matching live checks in
41000977748. Full CI 41000832309 exposed two Firefox historical interrupted-
update failures. Local reproduction loaded the new candidate HTML while offline
and failed its uncached new entry module with NS_ERROR_CORRUPTED_CONTENT.
Firefox's worker-owned fetch still reached the live fixture origin despite
context offline emulation. The fixture now destroys incoming connections during
offline phases as well as setting the browser offline. It reconnects only for
the explicit retry, records rejected network attempts, and additionally requires
the old app entry after failed-install recovery. No original readiness, cache,
storage, explicit acceptance, learning or old-client assertions are removed.
Require fresh complete exact-commit CI and matching live review after correction.
All ten corrected Firefox historical journeys passed locally, with 40–80
origin requests blocked per case during actual disconnected phases. No browser
sandbox override is committed; CI retains its standard installed dependencies.


## Phase 2: returning-player clarity

Baseline: completed Phase 1 5d7cf80, all twelve CI jobs passed with 223 units /
849 browser cases; matching READY production and eight passing live checks.

Demonstrated on the original resume journey: after a timed saved play expired
on Home, Next when you continue still promised Ready: choose End turn to keep
this play. Actual continuation resets that draft and draws one tile (or passes
when the pool is empty). The old generic deadline caveat did not correct the
contradictory primary instruction. A browser regression failed with that exact
stale Ready message after advancing past the deadline.

ResumeGuide now observes wall time without mutating the saved game. It updates
while Home is open and on visibility/focus return, and cleans up its interval
and listeners. Expired instructions explain the reset and draw/pass before the
player continues. Editable drafts explain how Undo differs from penalty-free
Reset; missing/empty Undo history offers Reset alone. Expired turns do not promise
recovery controls which continuing will bypass. Both full and Simple Home share
this behavior; all deadlines, engine rules and game saves remain authoritative.

The extended return journey also exposed a standard-view What can I do now?
summary whose native hit check failed the existing 44 px minimum. Both that
summary and Reset, Draw and Pass explained now have 44 px minimum targets,
16 px summary/body text (18 comfortable) and native scroll clearance. This stays
inside the existing More overlay, preserving meld space and tile dimensions.

Verification retains every original resume/expiry assertion and adds real Undo,
Reset, help reading, exact save/deadline checks, plus a logical seven-day untimed
absence. Two additional bilingual cases cover absent/empty Undo history, actual
Reset, full/Simple Home and an empty-pool timed draft becoming a pass after a
logical week away. Home remains byte-for-byte read-only before continuation;
then actual expiry restores the turn-start table/rack and passes exactly once
without adding a tile. The Chinese control verifies the final consecutive pass
ends a blocked round; copy does not promise a next player when results follow. The existing timed case covers the one-tile draw path.
The existing named-turn/multi-opponent and dismissed-coach help checks are retained.

New browser coverage runs in main Chromium and all three production compatibility
profiles; the existing resume tests remain in both original offline shards.
Expected totals are 223 units / 857 browser cases (339 main + 136 per compatibility
profile + 70 offline + 40 historical upgrades). The supplemental release review
now runs all six bilingual beginner/return cases in each of four browser profiles:
24 matching live checks. Original job, offline-step and bundle limits remain.
Clock advancement is logical timing evidence, not physical suspension or a human
older-player study. Multiplayer and human/physical-device studies remain paused.

Local build/type checking passes with 99293 initial gzip bytes and 77 cache files.
All 223 units, four refined Chromium returning journeys and the earlier six-case
Chromium/Firefox release reviews passed. Initial validation also caught optional
legacy Undo history; absent and empty history are covered separately. Existing
save checkpoints wait for the mounted Saved indicator before recovery actions.
Require complete exact-commit CI and the expanded 24-case live review before
considering Phase 2 released.

The final six-case Firefox release review passed, including native Undo/Reset,
both expiry paths and the blocked-round ending. An isolated local returning-only
run reported a click without delivering DOM mouse events; temporary input/window
diagnostics were removed. No application-input workaround, browser profile change,
forced action, geometry tolerance or extra wait was added. The full configured
review and required CI/live matrices retain native recovery assertions.

Initial Phase 2 publication 60bdc23 reached READY production. Expanded live run
41050126652 caught an early checkpoint in the new empty-pool journey: the old
Saved label was still present while the latest placement persisted. The expected
raw checkpoint contained the reset board, while the actual later save correctly
contained the new played tile. The test now requires the exact expected edited
reducer state and Saved before capturing bytes; all subsequent Home immutability,
expiry, geometry and actual recovery assertions remain unchanged. Fresh complete
exact-commit CI and all 24 matching live cases are required after correction.


## Phase 3: Chinese learning and mistake recovery

Baseline: fd2c185, full twelve-job CI 41050591499 passed (223 units / 857 browser
cases), matching READY production and all 24 live cases in 41050800697 passed.

The lesson correction assumed every step had tile IDs. At the acknowledgement,
End turn and Draw stages those IDs are empty, so an unexpected selection produced
For this step, select . Other tiles can wait. Attempting a new meld could also
produce an empty exercise tile list. The connected browser regression failed on
that exact empty-list message before the fix. The incomplete-play Reset stage
also needs an action rather than another selected tile.

Corrections now name the current button in English or Chinese. Selection tips
derive from current selected IDs and the current objective, so a selection kept
across the acknowledgement gets the new End turn instruction. A successful
progress update clears old rejected-action feedback while preserving storage
warnings. Mere selection and rejected moves never save or alter practice/regular
state. Existing restart, Escape, Undo, Reset, progression and normal objectives
remain. Captions and recorded instructions are unchanged, preserving exact audio
matches and optional listening; no pronunciation or older-player study is claimed.

The existing connected bilingual release journey now intentionally selects and
misplaces a tile at the acknowledgement, End turn, Draw and Reset stages. Each
must name the actual current action, clear selection tips with Escape, retain
exact regular/practice bytes after rejection and expose the complete correction
inside its real scroll bounds. The acknowledgement additionally advances while
a tile remains selected: its correction must switch to End turn without changing
the saved game position. All original lesson completion, new-game, draft recovery,
backup, actual ending, menu, accessibility and responsive assertions remain.
Chinese feedback is checked for accidental untranslated English as well as exact
translated content. Nested action-label translation is covered in the existing
translation unit test, including the Draw a tile key without its decorative arrow.

Hint explanations were reviewed and existing preview checks passed in both
languages at phone/tablet widths: read-only preview, labelled rack tiles, opening
arithmetic, explicit placement, Undo and timer-expiry invalidation. The existing
real-planner learning flow also passed. No demonstrated hint defect justified a
planner, hint strategy or rule change. Human Mandarin listening remains paused.

Two additional native-mouse desktop cases cover the 1440×900 clipped-copy layout
in English/standard and Chinese/comfortable reading. They exposed a feedback
bottom of 328.09375 in a copy area ending at 328 px; inner end padding provides
real clearance. Phone recovery also exposed a rack tile bottom of 667.1875 in a
667 px viewport. Practice tiles/feedback now retain 12 px scroll margin. Page-flow
copies retain zero end padding, preserving their existing space. Clearing
corrections resets the inner copy scroll so the next instruction is visible.
The desktop Watch next-action target also failed native stability until lesson
primary hover movement was removed; colour feedback remains. No forced mouse
movement, target relocation, epsilon tolerance or larger timeout was used.

No cases are removed or timeouts increased. Expected full counts are 223 units
and 859 browser cases (341 main, 136 per compatibility profile, 70 offline and
40 historical upgrades), with all 24 matching live release checks required.
Native phone, tablet and desktop projects retain their target/table-space bounds.

Local acceptance: all 223 units, seven connected-learning/hint-preview checks,
four final phone/desktop lesson journeys and all six built Chromium release
journeys passed. The final build is 99335 initial gzip bytes under the unchanged
100000-byte budget, with 77 cached files. Full exact-commit CI and matching live
acceptance remain required; local automation does not establish native listening
or physical-device usability.
The final six built Firefox release journeys also passed with every new lesson
correction/visibility assertion and the existing returning-player checks intact.
