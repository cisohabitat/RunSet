# Bot, hint, and responsiveness measurements

The machine-readable observation is [BENCHMARKS.json](BENCHMARKS.json). Regenerate:

```sh
npm run benchmark -- --seeds=2 --budget=380
# Longer balancing sample (takes substantially longer):
npm run benchmark -- --seeds=20 --budget=380 --out=benchmark-long.json
```

The script bundles the actual pure engine into a temporary Node module; it does
not open a server or require credentials. It uses identical seeded deals and
rotates Easy, Normal, and Hard through all three seats. Time-bounded searches can
choose different moves on different machines, so the deals are reproducible,
not a promise of identical final scores. The report records CPU, Node, budget,
seed, rotation, legal-turn checks, and latency percentiles.

The later [difficulty review](DIFFICULTY_REVIEW.md) adds a broader, balanced
head-to-head and three-player evaluation. It records rejected original plans
separately from safe reducer draws; the pilot below checked completed states.

## Recorded pilot

Six games, from two seeded deals and three seat rotations, completed with all
106 tiles conserved and every final-turn table legal. Easy won 0, Normal 5, and
Hard 1. This small sample does **not** establish a difficulty ranking; it shows
that Hard's greater search complexity is not yet evidence of stronger overall
strategy. Use the longer sample before changing game-balance claims or tuning
against individual deals.

Observed planner latency on the recorded Node host:

| Difficulty | p50       | p95       | Maximum   |
| ---------- | --------- | --------- | --------- |
| Easy       | 0.40 ms   | 1.03 ms   | 3.19 ms   |
| Normal     | 0.39 ms   | 0.87 ms   | 2.76 ms   |
| Hard       | 380.01 ms | 380.27 ms | 382.68 ms |

All three recorded hint cases produced legal plans without mutating the state or
ending the turn. A separate regression verifies a useful table re-partition
(removing a red 7 from a four-colour group to extend a run with rack tiles) that
the previous Normal-only hint could miss. Hints now use bounded Hard planning
after opening and still require explicit placement and shared-engine validation.

## Browser behavior

`e2e/planning.spec.ts` delays worker startup by three seconds and applies 4× CDP
CPU throttling. The local check opened the Game menu in 130 ms while planning;
it asserts controls remain responsive and the hint subsequently arrives. This
is a simulated browser stress check, not an iPhone or iPad benchmark.

Planner imports must finish and send a ready handshake before the computation
watchdog starts. Startup has a separate 10-second cap; computation has a
2.5-second watchdog, while the algorithm's own smaller search budgets remain
unchanged. Abort, deletion, screen changes, and new turns still terminate the
worker. This prevents slow startup from spending the entire computation allowance.

CI runs the full browser regression plus a short benchmark smoke test. Treat
physical Apple-device timings, a larger win-rate sample, and the beginner study
as separate measurements. The broader Node win-rate sample is recorded in the
difficulty review; physical-device timings and the beginner study remain uncollected.

`npm run build` also checks a 100,000-byte gzip budget for initial HTML plus its
referenced CSS and JavaScript. Lazy practice and worker chunks are separate.
