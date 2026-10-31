# Connecting mistake guidance to practice

Phase 3 of the [reliability/accessibility cycle](RELIABILITY_ACCESSIBILITY_ROADMAP.md).
The baseline is dff9251a9760f581dce1043623312731f4ecb94f: all twelve jobs in
[CI 41175960142](https://github.com/cisohabitat/RunSet/actions/runs/41175960142)
and all 72 matching hosted cases in
[41177284740](https://github.com/cisohabitat/RunSet/actions/runs/41177284740)
passed with matching READY production.

## Findings and behavior

Move help already explains an actual blocked move or unfinished draft, while
temporary position practice was a separate entry in More. A beginner had to leave
the explanation and find that tool without the correction text beside its board.
Sending the player to a saved exercise would also introduce an unnecessary draft
replacement or screen transition.

Move help with affected tiles now offers **Practise this correction**. It closes before opening the
existing temporary position-practice dialog and carries the current reason and
next step into a labelled **Correction to practise** section. The practice copy
still uses the existing public-position projection and reducer. Nothing is
selected, repaired, checked, saved or copied back automatically.

The regular Game stays mounted with its selected tiles and unfinished edits.
Returning or pressing Escape restores the actual move-help opener. The original
deadline keeps running; real turn replacement/expiry closes the stale copy. An
obsolete help-data identity cannot open a queued practice request.

The contextual entry has a shorter introduction so its goal and tiles remain
easy to reach on phones. The full explanation is retained in **About this
practice copy**; the timer warning stays visible. The generic More → Practise
this position entry retains its existing introduction. No permanent board row,
new lesson, storage key, schema, runtime dependency or game rule is introduced.

## Reproduced layout correction

The connected Chinese phone check exposed the bottom of a 48 px Check control
at 578.453125 px inside a practice body ending at 578 px; the joker case also
exposed 560.453125 px inside a body ending at 560 px. A control scroll margin
alone could not reveal the whole target at the scroll limit. The body now has
12 px end padding and its native controls have 12 px block scroll margins.
Move-help practice controls retain at least 48 px height and scroll clearance.
Tile dimensions, table floors and strict clipping assertions remain unchanged.

## Acceptance

Six bilingual cases cover blocked rack-only opening, incomplete-run repair and
joker replacement/reuse. Each checks the carried explanation, one open dialog,
native touch/mouse or Tab/Enter entry, exact localStorage bytes, preserved regular
selection/deadline, invalid Check without penalty, actual valid practice moves,
independent reducer expectations for the completed public melds, Return/Escape
focus and a fresh copy on reopening. The opening case also advances the real
deadline and requires the copy to close with exactly the engine's expiry result.

Compatibility/hosted cases disconnect before first use of the new entry and the
lazy copy. They retain saved short-lesson, exercise and whole-turn records and compare every
storage key during read-only/practice steps. Both dialogs receive Axe scans and
runtime-error checks. Native target tests use one scroll followed by
measurement-only polling against the viewport and actual modal-body bounds;
there are no forced clicks or fractional tolerances.

Expected full gate: 225 unit tests and 921 browser cases (355 main, 152 per
compatibility profile, 70 offline and 40 historical upgrades). Hosted review
retains every earlier case and adds six per profile: 96 total. The twelve-job
exact-commit CI, matching READY production and completed matching hosted review
are required before this phase is reported released.

Physical Apple devices, older-player comprehension and native Mandarin listening
remain paused/unverified. Automated labels, screenshots and Axe do not establish
human screen-reader acceptance or full WCAG conformance. Multiplayer is deferred.

## Local checks

The unit run passed all 225 cases; the final static/dynamic translation review
passed all seven cases. The broader run passed 22 main cases and built checks
covering the existing recovery/finders and generic copy (eight Chromium cases,
twelve in each other profile). After the shorter introduction/disclosure,
all six new cases passed in main Chromium and every built profile. Final main
checks also explicitly require a fresh rack on reopening and preserve all three
learning records after real expiry. English/light and Chinese/dark phone
screenshots show the correction, timer warning, practice tiles and fixed exit.

The final build passed type checking with 99,158 initial gzip bytes under the
unchanged 100,000-byte limit and 80 precached files. Test discovery confirms 355
main cases, 456 across the three compatibility profiles and 96 hosted cases.
These local results supplement the required publication gate; they do not report
CI or production acceptance for a commit that has not yet completed those runs.

## Eligibility correction before acceptance

Review of the first published candidate, 4ca5ae8, found that generic draw/pass
advice also offered the new entry. A public-position copy intentionally cannot
draw unseen tiles, so that promise was unsupported. New bilingual witnesses use
real Reset, public-only rearrangement and End turn to reach the engine's actual
Draw advice (English) and empty-pool Pass advice (Chinese). Both failed before
the correction because the entry was still present. The new entry and its launch
guard now require affected physical tiles. General draw/pass explanations and
the existing generic position-practice entry remain available. No case count,
assertion limit or engine rule changes. The correction requires its own complete
exact-commit CI and matching hosted gate.

After eligibility correction, all six main cases passed, and both changed
Draw/Pass witnesses passed in built Chromium and both WebKit profiles. A focused
local Firefox launch missed the initial More click: neither that control nor an
independent temporary button at y=736 received a native pointer event, while the
same probe at y=502 did. Changing the virtual screen/launch dimensions did not
repair it. The probes were removed; the native mouse and strict open/geometry
assertions remain. No local focused-Firefox success or application pointer fix
is claimed from that diagnostic. Full Firefox CI remains required. The corrected
build passed type checking at 99,157 initial gzip bytes / 80 precached files.
