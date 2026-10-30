# Visual clarity and easier play

Baseline: f6e1288, complete CI 40995269203 passed (223 units / 849 browser
cases), matching READY production and eight passing bilingual live checks in
40995383142. Multiplayer and physical Apple/older-player/native Mandarin studies
remain deferred or paused as previously agreed.

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Fresh phone, iPad landscape and desktop visual review; fix demonstrated layout issues | Implemented; require complete exact-commit CI and matching live review |
| 2 | Returning-player clarity: turn ownership, unfinished moves and finding help | Planned |
| 3 | Chinese learning instructions, hint explanations and mistake recovery | Planned |
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
