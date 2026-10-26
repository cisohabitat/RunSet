# Bot difficulty review

Review date: 2026-10-26. This evaluates the current production engine without
changing bot strategy, game rules or difficulty defaults. Machine-readable
results are recorded separately for [three-player rounds](DIFFICULTY_MIXED.json)
and [head-to-head rounds](DIFFICULTY_PAIRS.json). Partial checkpoint JSON must
not be presented as final.

## What the levels actually do

| Level  | Current behavior                                                                                | Limits                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Easy   | Finds rack groups/runs; after opening, sometimes plays only the first meld of a multi-meld plan | Does not extend existing melds; its opening uses the same rack solver as the other levels             |
| Normal | Same rack solver, then greedily adds leftover rack tiles to the first locally valid meld        | Does not rearrange the existing table or look ahead                                                   |
| Hard   | Normal-style baseline plus bounded whole-table repartition search after opening                 | Chooses a rearrangement only if it plays more rack tiles; no future-turn simulation or opponent model |

All levels obey the shared reducer. Hidden opponent racks are removed before
planning, as in the production worker. The code uses the current rack/table,
opening status, and seed/turn for Easy's deliberate simplification; it does not
plan using opponent tiles. The initial rack search maximizes opening points;
after opening it maximizes tile count, with a points tie-break. This is a
heuristic, not an optimal long-term strategy.

The setup tagline **Think ahead** overstates Hard's implementation: it searches
more rearrangements in the current turn. It is not a future-turn search.

## Evaluation method

Run sequentially in one warmed Node process per format, at the production 380 ms
total bot search budget, using new deals 101–110 rather than the old pilot's
deals 1–2:

```sh
node scripts/review-difficulty.mjs --mode=mixed --seeds=10 --first-seed=101 --budget=380 --out=docs/DIFFICULTY_MIXED.json
node scripts/review-difficulty.mjs --mode=pairs --seeds=10 --first-seed=101 --budget=380 --out=docs/DIFFICULTY_PAIRS.json
```

- Three-player: all six permutations of Easy/Normal/Hard for each deal, 60
  rounds.
- Two-player: each pair in both seat orders for each deal, 60 rounds. Every pair
  gets 20 rounds, and every difficulty participates in 40 rounds.
- Keep raw per-round seats, seed, winner, ending, tie status, opening turn and
  remaining rack points. Record p50/p95/p99/max planning latency per difficulty.
- Check every original proposal with the shared validator before applying it. A
  rejected proposal is counted separately from an intentional draw/pass. Keep
  replayable examples and rejection reasons; do not call a safe fallback a legal
  submitted plan. Check all 106 physical tiles and every completed table.
- Compare Normal on the same positions faced by Hard after opening. Only
  accepted plays count in this comparison; invalid baselines count as zero tiles
  played.
- Save a checkpoint after each round and mark reports complete only after all
  ordered assignments finish. Record CPU, Node, time, budget and engine hashes.

## Findings from source review

**Joker extensions can waste turns.** Normal's extension loop checks only
`inspectMeld([...tiles, id]).valid`. An extended meld can be locally valid while
changing a joker's represented value/colour without the required replacement.
The complete turn is rejected and the bot draws/passes. Hard can retain that
invalid baseline if it does not find a better, validated repartition. The game
protects the rules and tiles, but the bot can miss a legal alternative
elsewhere. This is a planning-quality defect, not a penalty imposed on the human
player.

**The old benchmark could not detect this.** It checked the completed table
after `botTurn`, by which time the reducer had replaced a rejected play with a
draw. The new harness records proposal rejection as well as valid completed
states. It also separates passes from draws and tests both seat directions.

**Search time alone is not strength.** Hard spends its extra budget exploring
current-turn partitions, then compares only tile count. It does not optimize
future flexibility or estimate what the exposed table lets opponents play. Its
Normal baseline can already empty a rack, so a future performance change could
skip redundant search in those positions without changing strategy.

## Results

The three-player run is complete: **Hard 31, Normal 29, Easy 0** wins in 60
rounds. Across the ten deal blocks, Hard led Normal on three, Normal led on
three, and four were tied. This does not establish that Hard is stronger.

| Three-player measure            |     Easy |   Normal |      Hard |
| ------------------------------- | -------: | -------: | --------: |
| Moves                           |    1,978 |    1,986 |     1,987 |
| Accepted tile plays             |      402 |      733 |       730 |
| Tiles played                    |    1,382 |    1,571 |     1,603 |
| Rejected plans                  |        0 |       47 |        51 |
| Mean remaining rack points      |   107.88 |    50.90 |     48.78 |
| Median personal turn at opening |        2 |        2 |         2 |
| Planning p50                    |  0.41 ms |  0.44 ms |  80.20 ms |
| Planning p95                    |  0.89 ms |  0.91 ms | 380.19 ms |
| Planning maximum                | 11.00 ms | 13.60 ms | 382.34 ms |

All 60 rounds finished with conserved tiles and legal completed tables; **98
original plans were rejected**, all for joker replacement/reuse. The raw
report's `allSubmittedPlansLegal` is correctly false. There were 58 blocked
endings and only two rack-empty wins. One lowest-rack tie was resolved by the
existing seat-order rule. Easy's higher tiles per successful play reflects its
lack of one-tile extensions, not greater strength.

On Hard's 1,793 post-opening positions, a Normal plan was also evaluated against
the full shared validator. Hard played more tiles in **57 (3.18%)**, the same in
1,736, and fewer in zero. This measures immediate accepted tiles only, not
future strength. Both plans failed on 51 of these positions. One position
already had a Normal rack-empty finish, but Hard still used about 380 ms on
repartitioning.

The timing host is Linux / Node v24.19.0 on an AMD EPYC 9V74. The mixed run used
380 ms and ran from 12:32:39 to 12:39:06 UTC on 2026-10-26. No plan in the mixed
run exceeded 400 ms. This is not a guarantee for mobile hardware.

### Head-to-head results

| Pair           | Wins              | Rounds |
| -------------- | ----------------- | -----: |
| Normal vs Easy | Normal 20, Easy 0 |     20 |
| Hard vs Easy   | Hard 19, Easy 1   |     20 |
| Hard vs Normal | Hard 15, Normal 5 |     20 |

Hard led Normal on five seed blocks and tied on five; Normal led on none. This
is evidence of a head-to-head advantage on these deals, not proof of a universal
strength ranking. Its advantage was much less apparent in the three-player
format. Do not collapse these formats into one headline win rate.

| Two-player measure         |    Easy |   Normal |      Hard |
| -------------------------- | ------: | -------: | --------: |
| Rounds participated        |      40 |       40 |        40 |
| Moves                      |   2,257 |    2,368 |     2,364 |
| Accepted tile plays        |     506 |      846 |       854 |
| Tiles played               |   1,673 |    1,773 |     1,814 |
| Rejected plans             |       0 |       68 |        63 |
| Mean remaining rack points |  106.28 |    47.15 |     37.85 |
| Planning p50               | 0.42 ms |  0.46 ms |  83.29 ms |
| Planning p95               | 0.80 ms |  1.03 ms | 380.24 ms |
| Planning maximum           | 2.89 ms | 91.41 ms | 436.22 ms |

The pair run used the same host/budget, from 12:39:23 to 12:47:07 UTC. It had 56
blocked endings, four rack-empty wins and no lowest-rack ties. Hard found more
accepted tiles than Normal in 87 of 2,263 same-position comparisons (3.84%), the
same in 2,176, and fewer in zero. Both failed on 63 positions. Three positions
already had a Normal rack-empty finish but Hard still spent about 380 ms.

**Two Hard calls exceeded the 400 ms target**, with a maximum of 436.22 ms. The
algorithm checks deadlines cooperatively; the measured wall-clock cap is not a
hard guarantee. The cause of these specific overruns has not been isolated.
Browser worker startup/transport/UI timings are outside these measurements. The
separate 2.5-second worker watchdog is not a substitute for the algorithm's
smaller planning target. Profile the tail before claiming strict compliance.

Across both formats there were **12,940 turns, 114 blocked endings, six
rack-empty wins, and 229 rejected proposals** (Normal 115, Hard 114, Easy 0).
All rejection reasons were joker replacement/reuse; none corrupted tiles or
accepted an invalid table. Both reports correctly mark submitted-plan legality
false while completed states and tile conservation pass.

### Verified missed legal alternative

The first mixed-run rejection example, seed 101 / Hard turn 15, contains a black
9–12 run whose joker represents black 13. Adding black 7 makes a locally valid
7–12 run but changes that joker to black 8 without the required black 13
replacement. The whole turn is rejected. The same proposal also adds black 9 to
a separate red-9/orange-9/joker group without changing its joker's blue-9 role.

Replaying this exact saved example with `applyPlan` confirmed the original is
rejected. Removing only black 7 (physical tile 84) leaves an accepted, valid
one-tile play of black 9 (tile 86). The full state and proposal are stored in
`DIFFICULTY_MIXED.json` under `rejectionExamples[0]`. This demonstrates a lost
legal move, rather than merely an intentional draw.

## Recommended implementation order

1. **Fix joker-aware planning first.** Check complete-turn legality while adding
   tiles; skip an invalid extension and retain legal alternatives. Hard must
   compare candidate partitions against a validated baseline. Add regressions on
   submitted plans, including a legal alternative that would otherwise be lost.
2. **Use Normal as the general default and Easy for learning**, as the game
   already does. Keep Hard available for table rearranging without promising a
   stronger win rate or future-turn search. Replace the ambiguous “Think ahead”
   tagline with wording about rearrangements.
3. **Address planning cost and tail latency.** Skip redundant search after a
   legal rack-empty baseline (four observations across both formats). Profile
   the two >400 ms Hard calls and reserve/check budget headroom. Do not promise
   broad speed gains or a hard cap from the current measurements.
4. **Rerun after legality fixes on fresh held-out deals**, for example 201–220,
   with both seat orders and unchanged budgets. Only then consider stronger
   endgame/joker/rack-flexibility heuristics, evaluated against the unchanged
   baseline. Do not tune specifically to these ten review seeds.
5. **Measure player experience separately.** Frequent blocked endings and
   immediate tile-count metrics do not show whether older beginners enjoy the
   opponents or understand their moves. Human/device work remains paused.

This release publishes the evaluation tooling, raw data and review only. Bot
strategy, difficulty defaults, rules, user-interface copy and saved games are
unchanged. The recommended fixes are identified follow-up work, not shipped
changes.

## Limits

These are bot-only, single-round Node experiments. Ten seed values, reused
across both formats, are more informative than the six-round pilot, but
seat-swapped rounds and formats sharing a seed are correlated. Do not treat all
120 rounds as 120 independent deals, or infer beginner enjoyment from bot win
rates. Time-bounded search can differ under host load even with identical deals.
Timings surround `planBot`, excluding worker startup, cloning, transport and UI
pacing; production uses a fresh worker for each request, whose warm-up behavior
may differ. Physical iPhone/iPad timings, four-player strength, long matches and
the paused older-player study remain unmeasured.
