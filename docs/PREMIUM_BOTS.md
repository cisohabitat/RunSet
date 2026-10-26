# Premium phase 1: reliable opponents

## Problem and change

The original review recorded legal-looking extensions that changed a table
joker's represented colour or value without the required rack replacement.
The reducer rejected the whole turn safely, turning it into a draw/pass. This
protected the game, but lost legal moves included in the same proposal.

Normal now checks the entire candidate turn before accepting each extension,
and tries other destinations when one fails. Hard filters partitions with the
same authoritative validator during its search, allowing a rejected partition
to be replaced by a legal alternative. Memoization includes the chosen melds
when a full-plan predicate is supplied: identical remaining tiles do not imply
identical joker legality.

A legal rack-empty baseline returns immediately. Search loops check deadlines
before generating more candidates. The requested production budget remains
380 ms, with a 240 ms work cap to leave headroom for validation and runtime work.
Cooperative deadlines do not guarantee a hard wall-clock bound on every device.
Hard is described as a table strategist; it searches the current turn, without
future-turn lookahead or access to opponents' hidden racks.

## Regressions

- The recorded seed-101 joker failure keeps Normal's legal black 9 and lets Hard
  choose a legal play, including a better alternative if found.
- An illegal first destination does not hide a legal destination for that tile.
- A rejected partition does not prevent accepting a different partition using
  the same number of tiles.
- A rack-empty baseline avoids unnecessary rearrangement search.
- Seeded simulations validate original proposals before the reducer fallback,
  as well as completed tables and all 106 physical tile IDs.

## Held-out evaluation

The initial fixed-planner trial used seeds 201–220, separate from the original
review's 101–110. All 240 rounds completed with zero rejected proposals and
26,201 legal, conserved turns. Its 320 ms work cap had one head-to-head call of
424.85 ms; the mixed maximum was 342.10 ms. These complete reports are retained
as [initial mixed](PREMIUM_BOTS_INITIAL_MIXED.json) and
[initial pairs](PREMIUM_BOTS_INITIAL_PAIRS.json), including that timing failure.

The final work cap is 240 ms. The timing follow-up uses separate seeds 301–305,
all six ordered assignments per seed in each format, production redaction, and
the requested 380 ms budget. Reports contain engine fingerprints and host details:

```sh
node scripts/review-difficulty.mjs --mode=mixed --seeds=5 --first-seed=301 --budget=380 --out=docs/PREMIUM_BOTS_MIXED.json
node scripts/review-difficulty.mjs --mode=pairs --seeds=5 --first-seed=301 --budget=380 --out=docs/PREMIUM_BOTS_PAIRS.json
```

Both final-cap reports are complete: [mixed](PREMIUM_BOTS_MIXED.json) and
[pairs](PREMIUM_BOTS_PAIRS.json).

| Format       | Rounds | Conserved turns | Rejected proposals | Hard p95  | Hard maximum | Calls over 400 ms |
| ------------ | ------ | --------------- | ------------------ | --------- | ------------ | ----------------- |
| Mixed        | 30     | 3,035           | 0                  | 240.07 ms | 253.26 ms    | 0                 |
| Head-to-head | 30     | 3,507           | 0                  | 240.09 ms | 246.75 ms    | 0                 |

All planning inputs stayed unchanged and all completed tables were legal. Three
rounds ended with an empty rack; 57 ended with the blocked-pool rule. Hard won
19 mixed rounds and 17 pair rounds; Normal won 11 and 13 respectively. These are
five seed blocks per format, not 60 independent deals or a general strength
ranking. Rack-empty baseline finishes took 0.44–0.50 ms in this follow-up.

A checkpoint with `complete: false` is not a completed evaluation. The historical reports remain
unchanged so the original defects are reproducible. Seat orders and formats
reuse deals, so rounds are correlated; these results cannot establish human
enjoyment or performance on a physical iPad.

Timing host: Node 24.19.0, AMD EPYC 9V74, Linux. No browser/unit suite runs during
the measured evaluations. The overrun's exact runtime cause was not profiled;
the reduced work cap adds headroom, rather than claiming a hard real-time bound.
The review tool now retains redacted states for future calls exceeding 400 ms.

## Release verification

Strict typecheck and production build pass. Unit coverage totals 96 passing
tests; the strengthened production-budget fixture takes approximately 244 ms on
this host. All 131 Chromium flows and ten production offline flows pass. The
three-round seed-1, 20 ms benchmark smoke also passes conservation, table and
hint checks. Initial HTML/CSS/JS total 96,371 bytes gzipped (100,000-byte budget).
Exact-commit GitHub CI must pass before Phase 2 begins.
