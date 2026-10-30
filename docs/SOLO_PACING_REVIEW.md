# Solo pacing and difficulty review

Phase 3 of the [decision-clarity cycle](DECISION_CLARITY_ROADMAP.md).
Baseline `1b41fc7e0f63b10deaae321e21843d811a1416eb` passed full CI
[41094208501](https://github.com/cisohabitat/RunSet/actions/runs/41094208501)
(225 unit / 875 browser tests), matching READY production and all 40 live
checks in [41096842874](https://github.com/cisohabitat/RunSet/actions/runs/41096842874).

## Findings and resulting behavior

Repeated Easy draws in this sample predominantly reflect its deliberate
new-groups/runs-only style. After opening, Normal can also extend existing
melds. Changing Opponent pace changes the waiting interval; it does not grant
Easy those extension moves. The optional bilingual Opponent styles and fair
play guide now makes that connection explicit, without adding board content.

Keep the existing strategies, default one Easy opponent, 1400 ms pace, untimed
new games and bounded planning budgets. No illegal plan, missed witnessed
opening or pacing defect was found that justifies changing them. This is not a
claim that every legal move is found, that human players prefer these defaults,
or that the levels have a universal win-rate ranking.

## Fresh recorded rounds

Raw reports: [mixed](SOLO_BOTS_MIXED.json), [pairs](SOLO_BOTS_PAIRS.json),
[summary](SOLO_BOTS_SUMMARY.json). These are new ordinary deals 85001–85004,
with all six ordered mixed seatings and both directions of each head-to-head
pair. There are 24 rounds per format, 48 total and 5190 actual turns. The four
seed blocks are shared across formats and seats; these are not 48 independent
deals. Strategies were not tuned to these seeds.

All 106 physical IDs, completed tables, immutable redacted planner inputs,
original proposals before fallback, validated Normal baselines and per-round
action/rack accounting passed. No witnessed opening was missed among 120
opportunities (40 per level). No measured actual-plan call exceeded 400 ms;
maximum calls were Easy 12.73 ms, Normal 13.29 ms and Hard 245.25 ms. Requested
planning remained 380 ms, with the existing 240 ms effective work cap.

| Observed draw streaks on personal turns | Mixed median / p95 / max | Pairs median / p95 / max |
| --- | --- | --- |
| Easy | 3 / 9 / 18 | 3 / 9 / 14 |
| Normal | 2 / 4 / 9 | 1 / 5 / 9 |
| Hard | 1 / 5 / 9 | 1 / 5 / 9 |

A streak means consecutive turns belonging to that player, with intervening
opponent turns omitted. A play or pass breaks it; another player's win can
truncate it. Easy made 1281 draws, including 115 before opening and 1166 after.
On 1061 of those post-opening draws, an independently validated Normal plan on
the same input could play rack tiles. Every one of those witnessed alternatives
only added to existing melds; none of those proposals created a new meld. This explains a large
style gap without proving that the remaining draws had no legal alternative.

Across 1526 post-opening Easy comparisons, Normal played more immediate rack
tiles 1399 times and the same count 127 times. Normal could empty Easy's rack
in two recorded positions where Easy did not; both occur in one correlated
round and depend on extensions outside Easy's style. Bounded full witnesses
remain in the pairs report. This is not two independent endgame trials.

Hard played more immediate rack tiles than its independently validated Normal
baseline in 181 of 1592 post-opening comparisons, the same count in 1411 and
fewer in zero. The sample contains only one Normal-baseline rack-empty
opportunity for Hard; it completed it. Existing tactical/endgame regressions
remain necessary. Extra search often retains Normal's move, so pace should not
be presented as strength and Hard should not be described as future-turn search.

Mixed wins were Easy 0 / Normal 8 / Hard 16; pair-format wins were 0 / 8 / 16.
Forty-two rounds ended with the pool exhausted and consecutive passes; six
emptied a rack. Bot-only wins and blocked endings do not measure human enjoyment
or prove that all possible moves were exhausted.

## Accounting and reproduction

The optional `--draw-review=true` mode adds same-input Normal comparisons for
Easy, per-round draw streaks and a count-only Easy action trace. Hidden opponent
racks, history and logs are redacted exactly as in production. Actual-plan
latency excludes baseline calls. Existing original-plan legality and accounting
checks remain. Raw reports retain engine/evaluator fingerprints and timing-host
metadata. Historical reports are not overwritten.

The separate verifier rechecks seed/seating coverage, action/rack totals,
per-level streak sums, Easy's ordered trace and draw phases, and every Easy/
Normal comparison counter. It also verifies current source fingerprints. A
negative control with an altered Easy action is rejected. Reading reported
summary flags alone is insufficient evidence of the new counters.

Run sequentially from a full checkout:

```sh
node scripts/review-difficulty.mjs --seeds=4 --first-seed=85001 --budget=380 --mode=mixed --draw-review=true --out=docs/SOLO_BOTS_MIXED.json
node scripts/review-difficulty.mjs --seeds=4 --first-seed=85001 --budget=380 --mode=pairs --draw-review=true --out=docs/SOLO_BOTS_PAIRS.json
node scripts/verify-draw-review.mjs docs/SOLO_BOTS_MIXED.json docs/SOLO_BOTS_PAIRS.json
node scripts/summarize-difficulty.mjs docs/SOLO_BOTS_MIXED.json docs/SOLO_BOTS_PAIRS.json docs/SOLO_BOTS_SUMMARY.json
```

Host: Node 24.19.0, Linux, AMD EPYC 9V74, five logical CPUs exposed. The mixed
run started at load averages 0 / 0 / 0.03; pairs at 0.87 / 0.34 / 0.16. The
sequential Node experiment does not establish physical Apple performance,
battery use, subjective pacing or older-player enjoyment. Time-bounded plans
can vary with runtime load despite identical deals. Human/device and native
Mandarin listening studies remain paused; multiplayer remains deferred.

## Native pacing verification

The bilingual browser journey uses a constructed ready human opening, then
actually accepts End turn to start Easy's turn. A transparent Worker subclass
counts native worker creation; it supplies no plan, readiness or response.
All four native Settings choices (700/1400/2400/5000 ms) must keep the worker
unstarted one logical millisecond before the boundary and start exactly once
at it. Every real worker produces the same accepted 33-point Easy opening.
The human rack, all tiles, expected table and final save remain validated.

At Unhurried, opening Settings halfway through the wait cancels the pending
callback. Five logical seconds while Settings remains open cause no planning
and preserve exact saved bytes/deadline. Closing it starts the full new wait;
no stale callback survives. The existing mock-based pace regression remains.

Clock control starts with Settings and the game already loaded on a human
turn; pausing before a first lazy Settings load stalled React's loading state
in the initial test setup. No application delay, timeout, forced action or
planner substitute was added to accommodate that fixture. Between seeded
repetitions the clock resumes while the human controls the turn.

After the real bot turns, both languages read the new opponent explanation
through the native More disclosure, checking full scroll/viewport bounds,
selected IDs and exact saved bytes. The case runs in main Chromium, all three
offline compatibility profiles and matching live production. All earlier
release cases remain. Expected totals: 225 units, 883 browser cases (347 main,
142 per compatibility profile, 70 offline and 40 upgrades), and 48 live cases
(twelve per profile). The twelve CI jobs, 20-minute jobs, five-minute offline
steps, tile/target/table floors and 100000-byte bundle limit remain unchanged.
Logical waiting checks do not establish physical-device suspension behavior.

Local release acceptance passed all 225 units, eleven existing opponent/comfort
flows, both refined four-pace native journeys, and all twelve configured release
cases in Chromium and Firefox. English/light and Chinese/comfortable/dark phone
captures were inspected. Independent verification passed both raw reports;
negative altered-action and duplicate-round reports were rejected, as was an
invalid draw-review flag before evaluation. All 97 local Markdown links and diff
whitespace checks passed. Build: 99417 initial gzip bytes, 77 precached files.
Local WebKit host libraries remain unavailable; provisioned full CI and matching
READY production with all 48 live cases are required before declaring this phase
released. Local automation does not establish paused human/device acceptance.
