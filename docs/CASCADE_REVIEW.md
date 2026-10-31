# Cascade and guidance review

Phase 4 of the [reliability/accessibility cycle](RELIABILITY_ACCESSIBILITY_ROADMAP.md).
Baseline: `fa9e8ed8a6938cc957b771401dee9c9571a7bcec`, whose entire twelve-job
[CI 41185578165](https://github.com/cisohabitat/RunSet/actions/runs/41185578165)
and all 96 matching hosted checks in
[41187009871](https://github.com/cisohabitat/RunSet/actions/runs/41187009871)
passed, with matching READY production. Those results do not verify this phase.

## Findings and change

A PostCSS declaration audit found 46 repeated property groups within identical
selector, enclosing media/supports context and importance in `src/styles.css`.
Forty earlier declarations used ordinary supported values and were superseded
by later declarations. Removed those earlier declarations and eight emptied
rule blocks: 56 source lines and 999 source bytes. The winning declarations stay
at their original cascade positions. No selector consolidation, specificity
change, media rewrite, shorthand reordering or cross-file move is included.
Six groups involving variables or clamp remain outside this narrow cleanup.

The removed values included older phone tile dimensions, table padding, header
height, action spacing and practice-panel overflow. These removals do not resize
the current UI: later rules already determined their values. Lazy styles, loading
states, all four workspace layouts, focus paint and touch-target floors remain.
There are no engine, translation, dependency, storage, timer or worker changes.

## Guidance review

Reviewed the inline end-turn help, first-game guide, optional What can I do now?,
resume summary, move explanation and contextual practice copy. The board's full
and compact coaching spans are responsive alternatives. Inline end-turn help is
hidden while first-game coaching or a hint is shown. Optional help retains the
longer explanation for people who explicitly ask for it. Read-aloud uses those
same translated instructions intentionally.

The move-help preview warning explains that viewing help makes no move and that
the clock runs. The separate copy warning explains that practice edits never
return to the saved game. Practice retains its own timer warning so it remains
clear after the previous dialog closes. These are different contexts and risks;
no demonstrated redundant visible instruction justified deleting them. Guidance,
recorded captions and both language catalogs remain unchanged.

## Bounded before/after comparison

The [raw comparison report](cascade-review/comparison.json) records baseline and
candidate CSS SHA-256 hashes, all 40 removals with original line positions, and
80 same-DOM comparisons: English/Simplified Chinese × standard/comfortable
reading × 390×844, 844×390, 1024×768 and 1180×820 × Home, crowded game, More,
position-practice copy and Learn to play.

A temporary local Playwright audit synchronously substituted the original and
candidate Vite source stylesheet on the same rendered DOM, with reduced motion.
It compared 25 computed layout/type/outline properties, pseudo-element content
and left margins, and exact element rectangles, including hidden descendants.
All 54,831 element comparisons matched without a tolerance. This is local
Chromium evidence for those fixtures/properties, not every visual state or a
pixel comparison. The temporary audit is not part of production or the counted
regression suite.

The production build passes at **99,025 initial gzip bytes**, down from 99,157,
against the unchanged 100,000-byte gate, with all 80 offline assets retained.

## Regression and release gate

The existing regression coverage already exercises the affected phone/iPad/
desktop layouts, native enlargement, keyboard focus, menus, practice copies,
first-use offline flows and historical upgrades. This CSS-only phase preserves
every case and assertion rather than adding tests that duplicate declarations.
Expected full counts remain **225 units, 921 browser cases and 96 hosted cases**:
355 main, 152 in each compatibility profile, 70 offline and 40 upgrades; hosted
acceptance remains 24 cases in each of four profiles. Timeout budgets, native
target bounds and exact save/deadline assertions are unchanged.

All 23 selected local Chromium interaction cases passed: connected beginner
journeys, native enlargement, landscape/rotation/larger controls, all six
correction-to-practice flows and both public-position-copy journeys. All 225 unit
tests, production typecheck/build, documentation links and diff checks passed.
The exact-
commit publication gate must complete before this phase is reported released.
Publish main, require all twelve CI jobs,
matching READY production, all 96 matching hosted cases and a final main/SHA
recheck. See [RELEASE_STATUS](RELEASE_STATUS.md) for the procedure.

Physical Apple devices, OS Dynamic Type, older-player sessions, human screen-
reader acceptance and native Mandarin listening remain outside these automated
checks and paused. No accessibility-conformance claim is made.
