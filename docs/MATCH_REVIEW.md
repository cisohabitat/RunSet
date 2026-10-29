# Complete-match review

Phase 2 verifies two- and four-player matches through an actual unique champion,
including scoring and recovery between rounds. The production change rejects
inconsistent saved match scores; gameplay rules and computer strategy are unchanged.

## Reproduced defect and correction

Save validation previously accepted a historical score row whenever it contained
finite numbers and the cumulative totals matched it. This admitted non-zero-sum,
fractional, impossible and incorrectly attributed scores. A completed save could
also disagree with its actual final racks. Two regression tests failed before
the correction. Scores must now be integers bounded by the entire deck's 788
points, sum to zero, credit the declared winner and debit the other seats.
Completed results must equal independently observable rack scoring. A playing
round cannot continue after a unique champion has reached the target.

The schema remains version 1. Invalid imports follow the existing visible error
path and preserve the exact current save. These are coherence checks, not proof
of every past move. A defensive tied-target fixture still continues, rotating
the next starter without changing seats. No scoring or tie rule changed.

## Complete ordinary-deal audit

Run `node scripts/review-matches.mjs --out=/tmp/match-audit.json`.
The versioned [raw report](MATCH_AUDIT.json) records sources, host, individual
round scores, cumulative totals and latency samples.

| Seed | Players | Opponents | Target | Timed | Completed rounds |
|---|---:|---|---:|---|---:|
| 71001 | 2 | Easy | 500 | No | 4 |
| 71002 | 2 | Normal | 100 | Yes | 20 |
| 71003 | 2 | Hard | 200 | No | 8 |
| 71004 | 4 | Easy / Normal / Hard | 500 | No | 3 |
| 71005 | 4 | Normal / Normal / Normal | 200 | Yes | 2 |
| 71006 | 4 | Hard / Normal / Easy | 200 | Yes | 2 |

All six completed: 39 rounds, 4,374 actions, 472 exact backup round trips and
100 unfinished-turn expiries at the original deadline. Every original proposal
was legal before fallback, all 106 physical IDs remained conserved, inputs were
unchanged, scores were independently recalculated and starter rotations retained
seat identities. No measured planner call exceeded 400 ms (Hard maximum 243.07 ms).
Double End turn at results cannot award scores twice; a champion cannot deal again.

One saved human is driven by a redacted Normal planner as a scripted stand-in;
computers use their configured styles. These six Linux matches establish neither
strength rankings nor human enjoyment. Logical expiry does not measure physical
mobile background suspension or battery use.

## Browser journey

English/light and Simplified Chinese/comfortable/dark journeys use literal names
including `constructor`, `Pass`, `电脑一` and `red 7`. A constructed near-win starts
round one; subsequent fresh rounds are fully played using native human controls
and actual computer workers until a unique champion emerges. No completed game
is imported as a substitute for playing those rounds.

The journey reloads results without duplicate history, exports the real backup,
rejects tampered score arithmetic without confirmation or lost save, and injects
a primary-write failure at the next deal. The previous completed-round bytes
remain until retry succeeds. Home/reload preserves the new deal and score; an
actual unfinished turn is downloaded, reloaded, undone and restored through the
backup confirmation before play continues. Every save retains all tile IDs,
literal names and correct totals. Final results get accessibility, runtime-error,
horizontal-overflow and screenshot checks. Compatibility runs establish offline
readiness and disconnect before the first computer turn.

Coverage is browser automation, not physical Apple-device or older-player
research. Browser choices use an Easy scripted human; logical clocks accelerate
computer delays while real worker computation keeps its native bounded budget.

## Release gate

Local verification passed: 222 units, production build/typecheck at 98,809 initial
gzip bytes under the original 100,000 cap, both main journeys and all six
compatibility journeys. Each browser run completed two actual rounds, with one
fresh round fully played (64 English / 65 Chinese actions after the first finish).
After publication, require quality, all six browser jobs and aggregate check on
the exact commit, then verify matching production and repeat the live journeys.
Keep the 20-minute CI jobs and five-minute-per-shard offline limit unchanged.
