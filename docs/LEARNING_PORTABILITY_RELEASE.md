# Learning and portability release evidence

This four-phase cycle extends complete-turn learning, varies layouts, transfers
progress through one optional file and explains recovery scope. English and
Simplified Chinese remain local, browser-only and offline-ready. No account,
backend or multiplayer is introduced. Physical Apple-device checks, older-player
sessions and native Mandarin voice acceptance remain paused.

## Accepted predecessor gates

The next implementation began only after the predecessor's complete exact-commit
workflow passed, including quality, every browser matrix job and aggregate check.

| Phase | Commit | Complete CI | Matching live acceptance |
| --- | --- | --- | --- |
| More whole-turn lessons | `6e07957` | [40541754858](https://github.com/cisohabitat/RunSet/actions/runs/40541754858) | Six bilingual WebKit/Firefox lesson journeys. Vercel initially queued, then became ready and passed live checks. |
| Varied layouts | `69f4c7d` | [40545701245](https://github.com/cisohabitat/RunSet/actions/runs/40545701245) | Six bilingual live layout journeys. |
| Portable progress | `26f3518` | [40551666374](https://github.com/cisohabitat/RunSet/actions/runs/40551666374) | Six bilingual live profile-transfer/rollback/resume journeys. |

Phase 4's final exact-commit workflow is inspected after publication. The
[main workflow history](https://github.com/cisohabitat/RunSet/actions?query=branch%3Amain)
records its full result; one passing matrix job or a ready Vercel build is not
used as complete CI acceptance.

## Delivered behavior

Whole-turn practice now teaches opening, extension, splitting runs, replacing and
reusing a joker, and choosing Draw. Actual accepted End turn completes applicable
goals; Draw completes only its own lesson. Invalid practice endings apply no
penalty. Required lesson objectives stay separate from regular-game rules.

Four deterministic layouts per lesson rotate colour families and vary fresh rack
order. Goal sets, clues, labels, physical IDs and solutions transform together.
All twenty combinations conserve 106 tiles and have engine-validated solutions.
Restart repeats a layout; Next layout explicitly starts a new attempt. Prompts
remain optional, with a quieter attempt available. No skill rating is inferred.
Legacy records without lesson/layout IDs remain opening/layout-one practice.

Home → Portable progress exports a validated game plus supported learning/view/
sound records in one file. Opening a file is read-only. Restoring an existing game
requires opting in; absent records are preserved. Imported deadlines and Undo
history remain. Successful restoration reloads to apply initial-read preferences.
Game-only backup files keep their original format and now use Restore backup
confirmation labels. Fresh deals keep Start new game and fresh-timer semantics.

Profile input uses a strict version/key allowlist, byte limit and pure nested
validators. Whole-turn records must meet the actual reader's size limit. Commits
use the existing serialized save lock and generation guard, snapshot affected
raw values and attempt rollback on failure. Failure or cancellation never triggers
a success reload; incomplete recovery is reported honestly.

Recovery review shows current and incoming game/practice facts, unfinished edits,
original deadlines, lesson/layout/mode, and included learning/display choices.
Player names stay literal. Invalid timestamps and unreadable preference values
remain safe and readable. Restored practice states whether it is unfinished,
ready to End turn, completed, or ended by drawing. Merely reading context or
showing steps preserves selection/draft and never plays audio automatically.

The final review also corrected an overly exact joker goal: a legal fourth group
tile is accepted after required replacement/reuse. Full engine validation and
required physical IDs still apply, including every colour layout.

## Verification and limits

Unit coverage includes all layouts/solutions, legacy and malformed records,
profile round trips, exact save/recovery/preference rollback, stale/aborted writes,
restored-state messages, muted sound semantics and invalid display timestamps.

Production browser journeys export actual files, simulate a receiving device in
the other UI language, reject invalid files without mutation, cancel a valid
preview, inject quota failure, verify exact rollback, keep or explicitly replace
the current game, apply imported language/preferences and resume an interrupted
quiet joker lesson through a legal four-tile group. They retain strict >=48 px
footer bounds, visible focused error feedback, Axe, horizontal bounds and runtime
error checks. The larger comparison exposed phone error feedback at the scroll
edge; centring it fixed the failure without weakening the geometry assertion.
A stale cross-language test locator was corrected to follow the actual UI language.

Game-only backup tests distinguish Restore from a fresh deal, preserve unfinished
turns/deadlines, and retain cancel behavior. Existing result/match/replay and fresh
replacement-timer regressions remain enabled. Whole-turn journeys verify ready
resume context and that a new attempt clears it. Light/dark phone/tablet
screenshots are inspected before release.

The final gate retains all Chromium, WebKit, Firefox, offline, benchmark and unit
checks, complete browser/audio installation, signed HTTPS mirrors, twenty-minute
job limits, five-minute offline limit and distinct failure artifacts. Initial
HTML/referenced assets remain under the unchanged 100,000-byte gzip budget.
Optional profile/practice/Chinese assets are included in the generated offline
cache. Final test counts and build bytes are recorded in the roadmap.

Linux WebKit and Chromium viewports do not prove physical iOS behavior. File
transfer does not install device voices. New captions use explicit Listen/device
speech until matching reviewed recordings exist; automated tests do not establish
Mandarin pronunciation, emotional delivery or older-player comprehension.
