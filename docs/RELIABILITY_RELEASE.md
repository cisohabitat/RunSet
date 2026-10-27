# Reliability and learning release evidence

Five separately published phases; each preceding phase's exact-commit CI passed
before the next implementation began. Multiplayer and human acceptance work stay
paused/deferred as described below.

| Phase | Published commit | Accepted CI run |
| --- | --- | --- |
| Cross-browser and audio startup | 2826a27 | [40459858493](https://github.com/cisohabitat/RunSet/actions/runs/40459858493) |
| Latest-play review | 0361d9a | [40462033335](https://github.com/cisohabitat/RunSet/actions/runs/40462033335) |
| Targeted practice | e2d07a5 | [40463428227](https://github.com/cisohabitat/RunSet/actions/runs/40463428227) |
| Display choices, including async delete check | 8e3cf2a | [40467118608](https://github.com/cisohabitat/RunSet/actions/runs/40467118608) |
| Longer-session comfort | Final phase in this release | [Exact main-commit CI](https://github.com/cisohabitat/RunSet/actions?query=branch%3Amain) must finish successfully before acceptance |

The first display-phase CI found a test reading storage before asynchronous
lock-backed deletion completed. Its follow-up awaits removal and checks that
Continue stays absent after reload. The complete follow-up CI passed; application
behaviour and geometric assertions were not weakened.

## Player behaviour

- Review latest play walks through final tile destinations from the completed
  snapshot. It does not invent an intermediate rearrangement sequence.
- Suggestions use unopened/joker final-rack facts and completed exercise kinds;
  an existing draft takes priority. No inferred skill rating is stored.
- Higher contrast preserves tile sizes, shape cues, drafts, selection and saves.
  It supports light/dark themes and remains enabled after deleting a game.
- Take a break saves before Home; failures retain the table with a retry notice.
  A cancelled request cannot navigate out of another screen after its lock clears.
  Home explains unfinished moves. Untimed rest preserves the draft; timed play
  retains its absolute deadline and applies normal expiry when returning.
- Unhurried pace waits five seconds before the opponent starts planning. It is
  independent of difficulty and turn limits, and survives reload and deletion.

## Verification and limits

Strict TypeScript, 124 unit tests and the production build passed locally. The
final initial download is 99,877 gzipped bytes against the unchanged 100,000-byte
budget. This includes initial HTML and referenced CSS/JavaScript; optional views,
Chinese dictionary, worker and audio remain precached and separately loaded.

The final CI coverage is 265 Chromium cases, 123 production WebKit/Firefox cases,
19 production offline cases and the planner benchmark smoke. New comfort flows
cover real UI edits, long untimed rest, reload/Undo, quota recovery, held-lock
cancellation, timed expiry and exact five-second scheduling. Both languages,
phone and iPad landscape, standard and comfortable views are represented.
Screenshots are visually inspected alongside Axe, focus, geometry and save checks.

Live checks target https://run-set.vercel.app/ after Vercel reports the matching
GitHub commit ready. Local Firefox live runs use the session's trusted public CA
certificates in a temporary browser profile; TLS verification remains enabled.
Local non-root browser dependencies and audio-output overrides stay outside the
repository. CI installs supported dependencies and a virtual audio sink normally.

WebKit on Linux is not physical Safari/iOS. The physical iPhone/iPad sessions,
older Chinese-speaking player study and native Mandarin listening remain paused
and unverified. Automated MP3 playback does not approve cheerful delivery or
pronunciation. Multiplayer remains deferred. No game rules, hidden-rack access,
save schema, timer policy or default opponent difficulty changed in this cycle.
