# Larger production bot review

Phase 4 evaluates unchanged production strategies on seeds 5001–5010, absent
from the prior checked-in report seed sets. Each format uses ten distinct deals
and all six ordered assignments: Easy/Normal/Hard in mixed play, both orders of
each pair in head-to-head play. The 60 mixed and 60 paired rounds are 120 rounds,
not 120 independent deals. Seat-swapped rounds sharing a deal are correlated.

Raw evidence: [mixed](EVERYDAY_BOTS_MIXED.json),
[pairs](EVERYDAY_BOTS_PAIRS.json). Both reports are complete. Engine/solver/rules
fingerprints are retained; no engine or strategy file changed in this phase.
Reproduce each sequentially with:

```sh
node scripts/review-difficulty.mjs --seeds=10 --first-seed=5001 --budget=380 --mode=mixed --out=docs/EVERYDAY_BOTS_MIXED.json
node scripts/review-difficulty.mjs --seeds=10 --first-seed=5001 --budget=380 --mode=pairs --out=docs/EVERYDAY_BOTS_PAIRS.json
```

## Legal actions and decisions

Every original proposal passed the actual turn validator before fallback. All
106 physical IDs remained conserved, every completed table was legal, and both
actual and separate baseline planning inputs remained unchanged. All 5,153
Normal baseline checks were legal. Independent report checks reconciled complete
seed/seat coverage, fingerprints and per-round totals with summaries, including
`14 + draws - tilesPlayed = remaining rack size` and personal action counts.

| Format / level | Plays | Draws | Passes | Accepted tiles | Known openings / missed | Wins / exposure |
|---|---:|---:|---:|---:|---:|---:|
| Mixed / Easy | 400 | 1467 | 75 | 1463 | 60 / 0 | 1 / 60 |
| Mixed / Normal | 696 | 1181 | 75 | 1578 | 60 / 0 | 22 / 60 |
| Mixed / Hard | 719 | 1157 | 76 | 1632 | 60 / 0 | 37 / 60 |
| Pairs / Easy | 491 | 1723 | 43 | 1698 | 40 / 0 | 0 / 40 |
| Pairs / Normal | 889 | 1466 | 46 | 1855 | 40 / 0 | 28 / 40 |
| Pairs / Hard | 904 | 1464 | 41 | 1842 | 40 / 0 | 32 / 40 |

Known opening opportunities use a validated Normal plan on the same unopened
position; they are not an exhaustive search for every legal opening. Hard's
post-opening same-input comparison covered 1,721 mixed and 2,243 paired positions.
Hard played more rack tiles in 92/119 positions respectively, the same in
1,629/2,124, and fewer in none. A validated Normal baseline could empty Hard's
rack once in pairs; Hard also finished there (0.94 ms). There were zero such
opportunities in mixed play. Zero misses therefore gives very limited finish
coverage and cannot establish optimal play.

Mixed endings: 59 blocked, one rack-empty. Pairs: 56 blocked, four rack-empty.
These 115 blocked endings out of 120 rounds are a reason to examine endgame
tactics on separately constructed positions in a future review. They do not
prove a missed legal move: the pool can legitimately empty and the bounded
baseline is not an optimal solver. Raw reports retain lowest-rack ties and
actual ending details (one lowest-rack tie in mixed, three in pairs). Wins are
descriptive, not a universal strength ranking
or evidence of human enjoyment.

## Full-call timing

| Format / level | p50 ms | p95 ms | p99 ms | Maximum ms | Calls >400 ms |
|---|---:|---:|---:|---:|---:|
| Mixed / Easy | 0.47 | 0.89 | 2.00 | 8.19 | 0 |
| Mixed / Normal | 0.62 | 1.58 | 2.81 | 11.52 | 0 |
| Mixed / Hard | 240.01 | 240.07 | 240.66 | 243.23 | 0 |
| Pairs / Easy | 0.49 | 1.00 | 1.86 | 15.57 | 0 |
| Pairs / Normal | 0.63 | 1.47 | 2.68 | 17.12 | 0 |
| Pairs / Hard | 240.01 | 240.08 | 240.73 | 244.68 | 0 |

Measured sequentially on Node v24.19.0/Linux, AMD EPYC 9V74, five visible logical
CPUs. Each report records start load, timestamps, fingerprints and per-round
latencies. Requested production budget: 380 ms; shared work cap: 240 ms. Baseline
calls are excluded from actual planner-call latency. No browser/test workload
ran concurrently with these timings. Time-bounded choices can vary with load,
so a seeded deal alone does not reproduce final scores exactly.

No demonstrated rule defect warrants a strategy adjustment in this sample.
Easy remains the default and all difficulty behavior is unchanged. This review
adds diagnostics and evidence, not speculative tuning. It excludes four-player
games and long matches. Node timings do not establish physical iPhone/iPad speed,
battery life, native Mandarin acceptance or older-player enjoyment; those studies
remain paused. Full exact-commit CI is required before Phase 5 begins.
