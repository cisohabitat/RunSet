# Player-comfort release evidence

This cycle improves independent single-player learning, opponent explanations,
crowded-board navigation and gentle feedback in English and Simplified Chinese.
The user authorized five separately published phases with full exact-commit CI
between implementations. Multiplayer remains deferred. Physical Apple-device
playtests, older-player sessions and native Mandarin voice acceptance remain paused.

## Accepted predecessor gates

| Phase | Main commit | Complete CI | Additional evidence |
| --- | --- | --- | --- |
| Smarter move help | 5261f88 | [40600611275](https://github.com/cisohabitat/RunSet/actions/runs/40600611275) | Six matching-live bilingual WebKit/Firefox journeys passed; local phone/tablet screenshots inspected. |
| Bot difficulty and fairness | 05dac50 | [40603733840](https://github.com/cisohabitat/RunSet/actions/runs/40603733840) | Six matching-live guide journeys; fresh 60-round audit with original-plan legality and raw timing reports. |
| Crowded-board overview | d11bb05 | [40607869355](https://github.com/cisohabitat/RunSet/actions/runs/40607869355) | Local production/offline/Chromium journeys and strict geometry; production deployment later reported READY. No additional live browser acceptance is claimed after workspace loss. |
| Gentler play and layout fixes | 91b8e2e | [40616483766](https://github.com/cisohabitat/RunSet/actions/runs/40616483766) | Full branch [40615259476](https://github.com/cisohabitat/RunSet/actions/runs/40615259476), six inspected CI fixture JPEGs, then complete main CI. |

The execution workspace became unavailable during Phase 3 CI. Its correction
and subsequent changes used the connected GitHub tools. Reviewed atomic commits
ran on isolated branches before main publication. Complete main workflows gated
the next implementation. Fixture-only CI JPEGs allowed actual visual inspection;
local commands and extra live browser checks are not claimed while unavailable.

Phase 5's complete branch and published-main workflows are inspected after the
commit exists. The [main workflow history](https://github.com/cisohabitat/RunSet/actions?query=branch%3Amain)
records its exact result. A passing quality job or Vercel build alone is not
complete acceptance. Git integration handles deployment; no direct Vercel CLI
deployment or new backend is introduced.

## Delivered behavior

Move help identifies the affected meld, finds actual tiles without changing the
selection and distinguishes repairing one meld from completing the whole turn.
Suggested additions are hypothetical reducer-accepted examples; ending remains
explicit and engine-validated.

Opponent styles and fair play reads actual named levels, including mixed imports.
Easy builds new melds, Normal adds extensions, Hard additionally searches
current-turn repartitions. All use the same opening and validation rules. Pace
changes waiting time only; drawing does not establish that no legal move exists.
Bot/hint worker-boundary tests remove other racks, logs and Undo history without
mutating the source state. The [fresh audit](PLAYER_COMFORT_BOTS.md) preserves all
raw reports, engine fingerprints and sample limits; no strategy tuning or human
difficulty ranking was inferred.

Table overview lists numbered public melds, their actual valid values and counts,
or Needs fixing. Joker values come from inspectMeld. Empty imported draft entries
cannot navigate to an undefined tile. Choosing a row closes the modal and finds
the actual board tile without selecting or placing it. The two-column wider
layout and two-line entries reduce scrolling while retaining 48 px targets.

Existing primary actions visibly identify an opponent turn, retaining native
disabled behavior with measured readable contrast. Actual observed wins use
twelve restrained particles; reduced motion keeps static information. Same-seed
completed imports, other external replacements, reopen and reload do not create
new win cues or celebrations. App keeps source state outside recovery boundaries;
save tools have independent lazy Home/menu boundaries and remain precached.
Recovery copy offers safe actions without assuming a network cause.

Result explanations use neutral factual labels for empty racks, lowest totals
and seat-order ties. Names remain literal, including You and words matching
dictionary entries. Missing end-condition evidence remains explicitly unknown;
no historical move or missed opportunity is invented.

## Problems found and corrected

Phase 3 CI caught an old round-two test reading storage immediately after a UI
action. It now awaits actual initial persistence, saved completion before reload
and the saved second round, retaining the same expected values and expiry checks.

New full-turn journeys exposed a long non-keyboard-scrollable notice and a
comfortable-phone board below 300 px. Diagnostics identified the wrapped timed
toolbar. The compact phone header retains the accessible View label and complete
save/timer/expiry text; native controls and full rack tiles remain. Comfortable
tablet/desktop turns also needed bounded focusable status/notice spacing and
10 px rack padding to retain the 450 px floor. Original rack-height caps,
58×80 comfortable tiles and 48 px controls remain. No threshold was weakened.

Visual review found waiting labels too faint under disabled opacity. They now
use normal ink on neutral surfaces while remaining disabled. Tests measure
4.5:1 contrast and full opacity because Axe excludes disabled controls.

## Final verification and limits

The release gate retains 170 unit tests, 292 Chromium cases, 81 cases for each
compatibility project and 39 offline cases: 574 browser cases in total, plus the
planner benchmark smoke. The matrix includes every existing project separately,
with full signed dependency installation, virtual audio, distinct artifacts,
twenty-minute jobs, a five-minute offline step and aggregate failure handling.
The unchanged initial-download limit is 100,000 gzip bytes; optional assets stay
in the generated offline cache.

Connected journeys use real reducer actions, saved bytes, actual downloaded
files and explicit imports. They cover interrupted timed drafts, all new help
tools, hidden-rack placement, a valid rack-empty ending, 106 conserved IDs,
delete/recovery scope, exact preferences and quiet offline reopening. Existing
update, storage-conflict/quota, accessibility, crowded-board, recorded playback,
learning and 1000-turn soak checks remain enabled.

Linux WebKit and desktop viewports do not establish physical iOS behavior.
Cue mocks and MP3 decoding do not establish audible Mandarin delivery, emotional
tone or older-player comprehension. Fresh bot timings are host/sample results,
not hard real-time guarantees. No AAA certification or human acceptance is claimed.

The first Phase 5 branch passed both new offline connected journeys but exposed
an older results assertion expecting the previous prose. Four visible-copy
assertions in two retained specs were updated after searching all 98 e2e
TypeScript files. The result cause and seat-order checks remain explicit;
legacy translation cases are retained. The corrected source needs a fresh gate.
