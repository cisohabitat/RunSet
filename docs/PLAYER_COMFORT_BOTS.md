# Bot difficulty and fairness recheck

This is a fresh regression sample after the earlier [360-round audit](QUALITY_BOTS.md),
not a new human difficulty rating. Production strategy is unchanged. Deal seeds
2001–2005 were not used by the earlier review: all six ordered mixed seats and
all six ordered head-to-head assignments ran sequentially, at the requested
380 ms budget with the existing 240 ms work cap. Browser/unit suites were not
running during these timing trials.

| Format | Rounds | Turns | Rejected original plans | Hard p95 | Hard max | Calls over 400 ms |
| --- | --- | --- | --- | --- | --- | --- |
| Mixed | 30 | 2,948 | 0 | 240.06 ms | 242.19 ms | 0 |
| Paired | 30 | 3,577 | 0 | 240.07 ms | 261.43 ms | 0 |

All original proposals passed the full turn validator before reducer fallback;
all 106 physical tiles were conserved; completed tables remained legal and
planner inputs unchanged. Two of 60 rounds ended with an empty rack; 58 ended
blocked. Five lowest-rack ties used the existing seat-order rule.

Mixed wins were Easy 0 / Normal 12 / Hard 18. Paired counts are Easy 0/20,
Normal 12/20 and Hard 18/20; pair totals combine different matchups. In the ten
Hard/Normal paired rounds Hard won eight and Normal two. Hard led on three of
five deal blocks and two tied, in both formats. Reused seat orders and formats
share deals: these are five blocks, not sixty independent samples. They do not
prove a universal ordering or beginner enjoyment.

From the same post-opening position Hard played more tiles than Normal on
59/877 mixed comparisons and 53/1,143 paired comparisons, fewer on none.
Most turns gave the same count. The two paired rack-empty baseline returns
completed within 0.39 ms. No strategy tuning is warranted by this small recheck.
Retain one Easy opponent and no timer as the beginner defaults.

More → Opponent styles and fair play now explains the actual named opponents
throughout a saved game, including mixed-level imported games. Easy makes new
melds, Normal also extends, Hard additionally searches current-turn partitions.
They share opening/rule checks. The guide distinguishes waiting pace from move
selection and explains that drawing does not establish the absence of a legal
move. Names stay literal, no skill rating is invented, and no additional board
row is reserved. Worker-boundary tests assert other racks, log and history are
removed for both bot and hint requests, leaving the original state unchanged.

Raw evidence: [mixed](PLAYER_COMFORT_BOTS_MIXED.json),
[pairs](PLAYER_COMFORT_BOTS_PAIRS.json), [summary](PLAYER_COMFORT_BOTS_SUMMARY.json).
Reports retain engine fingerprints and Node 24.19.0 / AMD EPYC 9V74 / Linux timing
host. The cap is cooperative, not a physical-device real-time guarantee.

Reproduce sequentially:

```sh
node scripts/review-difficulty.mjs --mode=mixed --seeds=5 --first-seed=2001 --budget=380 --out=docs/PLAYER_COMFORT_BOTS_MIXED.json
node scripts/review-difficulty.mjs --mode=pairs --seeds=5 --first-seed=2001 --budget=380 --out=docs/PLAYER_COMFORT_BOTS_PAIRS.json
node scripts/summarize-difficulty.mjs docs/PLAYER_COMFORT_BOTS_MIXED.json docs/PLAYER_COMFORT_BOTS_PAIRS.json docs/PLAYER_COMFORT_BOTS_SUMMARY.json
```

Physical Apple timing, older-player sessions and native Mandarin review remain
paused. Automated correctness and bot-only outcomes do not replace those checks.
