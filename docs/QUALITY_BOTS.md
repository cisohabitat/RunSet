# Bot difficulty audit — follow-up cycle

Status: complete. Both 180-round reports passed all legality, conservation and
immutability checks. Engine fingerprints match the measured production source.

This audit uses 30 fresh deal seeds, 501–530, separate from prior samples
101–110, 201–220 and 301–305. Each format runs all six ordered assignments:
180 three-player mixed rounds and 180 two-player rounds (both seat orders for
Easy/Normal, Easy/Hard and Normal/Hard). Search uses the production requested
380 ms budget and the shared 240 ms work cap. No production strategy is tuned.

The tool redacts other racks, history and log as the worker does; validates
original proposals before reducer fallback; checks unchanged planner inputs,
complete-turn legality and all 106 tile IDs; records endings, opening turns,
accepted tile counts, rack totals and full-call latency. Separate seed-block
lead counts compare Hard/Normal without pretending seat permutations are
independent deals. Formats sharing the same seeds are correlated too.

Commands:

```sh
node scripts/review-difficulty.mjs --mode=mixed --seeds=30 --first-seed=501 --budget=380 --out=docs/QUALITY_BOTS_MIXED.json
node scripts/review-difficulty.mjs --mode=pairs --seeds=30 --first-seed=501 --budget=380 --out=docs/QUALITY_BOTS_PAIRS.json
node scripts/summarize-difficulty.mjs docs/QUALITY_BOTS_MIXED.json docs/QUALITY_BOTS_PAIRS.json
```

Run sequentially without browser/unit suites competing for CPU. The summary
refuses incomplete reports, different seed sets and current engine fingerprints
that differ from the measured source. Preserve older raw reports as historical
evidence of the corrected joker-planning defects.

CI benchmark smoke now validates the original submitted tile inventory and
complete turn before `botTurn` can turn an illegal proposal into a safe draw.
It uses production redaction, checks input immutability, and counts empty-pool
passes separately from draws. The production reducer remains authoritative.

Interpretation: Easy creates new groups/runs and deliberately omits table
extensions/repartitioning. Normal adds legal table extensions. Hard additionally
searches current-turn repartitions; it has no hidden-rack knowledge or future-turn
lookahead. Keep the gentle one-Easy default. A bot-only win rate cannot measure
older-player comfort or establish that Hard always wins more than Normal.

## Results

| Format | Rounds | Turns | Rejected plans | Hard p95 | Hard max | Calls over 400 ms |
| --- | --- | --- | --- | --- | --- | --- |
| Mixed | 180 | 17,926 | 0 | 240.07 ms | 252.84 ms | 0 |
| Head-to-head | 180 | 21,286 | 0 | 240.08 ms | 259.00 ms | 0 |

Mixed wins: Easy 3, Normal 80, Hard 97. Across the 30 deal blocks Hard led Normal
on 14, Normal led on 8 and 8 tied. Head-to-head: Normal beat Easy 57–3, Hard beat
Easy 60–0, and Hard beat Normal 34–26. For Hard/Normal pair blocks, Hard led on
9, Normal led on 5 and 16 tied. These correlated outcomes support distinct
strategies and a weaker Easy bot in bot-only play; they do not establish a
universal Normal/Hard strength ordering or prove beginner comfort.

From identical post-opening positions, Hard played more tiles than Normal on
332/5,412 mixed comparisons and 351/6,888 paired comparisons; it played fewer
on none. Rack-empty baseline returns completed in at most 0.52 ms mixed and
0.89 ms paired. Most turns give Normal and Hard the same immediate tile count.

346 of 360 rounds ended by the blocked-pool rule and 14 by an empty rack; 14
lowest-rack ties used the existing seat-order rule. This is an important limit
on interpreting these bot-only games as a human pacing study. Do not change
the rules or increase beginner difficulty on the strength of these counts.

Raw evidence: [mixed](QUALITY_BOTS_MIXED.json), [pairs](QUALITY_BOTS_PAIRS.json),
[seed-block summary](QUALITY_BOTS_SUMMARY.json). The summary refuses incomplete
checkpoints and fingerprints that differ from current engine source. Manual
checks reproduced the prior 6,542-turn report and rejected an incomplete input.

Timing host: Node 24.19.0, AMD EPYC 9V74, Linux. Measurements ran sequentially
without browser/unit suites. The budget is cooperative: no measured overrun
is a result for this host/sample, not a hard real-time or Apple-device guarantee.
Physical iPhone/iPad timing, native listening and beginner studies remain paused.

Decision: keep the gentle one-Easy default and existing honest strategy labels.
No planner tuning was warranted by the audit. Publish the stronger benchmark
checks so future legality regressions cannot hide behind safe reducer fallback.

## Release gate recovery

The first Phase 1 CI run (`40420825563`, commit `b4a5384`) passed the full browser
suite but stalled in the offline step. The identical production offline suite
passed locally in 33 seconds (13 tests). GitHub accepted normal/force cancellation
requests but continued reporting the run active and refused a rerun. A corrective
workflow release retains every test, bounds offline execution to five minutes
and the full job to twenty, and cancels superseded runs on the same ref. The
fresh exact-commit CI must pass before accessibility implementation starts.
