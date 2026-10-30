# Game feel and difficulty review

This is phase 4 of the [older-player refinement](OLDER_PLAYER_REFINEMENT.md).
Phase 3 completed at 1cd3ba4 with full CI 40981124188 and all eight live
connected checks passing on matching READY production.

## Sound cancellation

Sound effects previously scheduled an entire cue on Web Audio oscillators but
retained no cancellation handles. Muting only prevented the next cue. A new
bilingual browser regression failed before the fix: nine unended mock notes
received zero immediate cancellation calls when Sound effects was switched off.

The sound module now retains active/future oscillators, removes and disconnects
ended notes, and cancels remaining notes on request without closing the primed
context. App owns mute, hidden visibility, pagehide and screen/unmount cleanup.
Turning sound back on or returning does not play queued cues. Optional speech
and recorded narration retain their independent controls and captions.

The unit regression checks cancellation, idempotence, ended-node cleanup, hidden/
muted/suspended guards and silent priming/resume. Existing bilingual gentle-play
journeys now switch Sound effects off/on through Settings and dispatch a logical
visibility change during selection. Exact saves, selection and original cue
counts are retained, along with a real accepted win, twelve bounded confetti
particles, reduced-motion behavior and no celebration/audio replay on reopen,
reload or imported completed results. These mocks prove scheduling and control,
not audible tone, pronunciation or physical mobile suspension.

## Pacing and celebrations

Opponent pace remains a separate 700/1400/2400/5000 ms wait before planning,
defaulting to 1400 ms; Unhurried remains available without changing difficulty.
Settings/confirmation/navigation cancel stale bot callbacks. Timed deadlines
remain absolute. New games still use one Easy opponent, no timer and guidance.
Celebrations remain tied to an actual new human win; imported/reopened results
do not replay them, and reduced motion keeps the static result readable.

## Fresh difficulty evidence

Raw reports: [mixed](REFINEMENT_BOTS_MIXED.json),
[pairs](REFINEMENT_BOTS_PAIRS.json), [summary](REFINEMENT_BOTS_SUMMARY.json).
Both formats use seeds 74001–74002 at the production 380 ms requested/240 ms
work budget: all six ordered mixed seatings and both orders of every pair.
There are 24 rounds across two seed blocks, with 2570 actual turns.

All original submitted plans and independent Normal baselines were legal.
All 106 IDs, completed tables, immutable planning inputs and round action/rack
accounting passed. There were no measured calls over 400 ms and no missed known
openings among 60 witnessed opening opportunities. Measured maximum calls:

| Level | Maximum milliseconds |
|---|---:|
| Easy | 8.32 |
| Normal | 11.14 |
| Hard | 242.31 |

In 792 same-input comparisons Hard played more tiles than the independently
validated Normal baseline 102 times, the same count 690 times and fewer zero
times. The sample supplied only one baseline rack-empty opportunity, which Hard
finished; zero such opportunities in mixed rounds supplies no finish coverage.
The other tactical/endgame regressions remain necessary.

Eighteen rounds ended legally with an exhausted pool and consecutive passes;
six emptied a rack. A blocked ending does not establish a missed legal move.
The audit supports keeping the existing strategies and defaults; it does not
justify changing difficulty to match these samples.

Host: Node 24.19.0 on Linux, AMD EPYC 9V74, five logical CPUs exposed. Reports
retain host load, source fingerprints, per-round action/latency data, known
opportunities and bounded redacted counterexamples. This is a bounded Node
experiment: seat swaps and formats sharing a seed are correlated, and two
seed blocks do not establish universal difficulty rankings, human enjoyment,
battery life or physical Apple timing. Older-player/native Mandarin/device
studies remain paused.

Reproduce sequentially from the repository root:

```sh
node scripts/review-difficulty.mjs --seeds=2 --first-seed=74001 --budget=380 --mode=mixed --out=docs/REFINEMENT_BOTS_MIXED.json
node scripts/review-difficulty.mjs --seeds=2 --first-seed=74001 --budget=380 --mode=pairs --out=docs/REFINEMENT_BOTS_PAIRS.json
node scripts/summarize-difficulty.mjs docs/REFINEMENT_BOTS_MIXED.json docs/REFINEMENT_BOTS_PAIRS.json docs/REFINEMENT_BOTS_SUMMARY.json
```

Local release checks passed: all 223 units, both bilingual sound/celebration
regressions and both connected beginner journeys. Production build: 99211
initial gzip bytes (100000 budget), with 77 offline cache files. Final main
still requires its own complete exact-commit CI and matching live checks.
