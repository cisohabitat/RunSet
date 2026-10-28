# Bot decision review

Phase 3 uses tactical regressions plus a balanced before/after audit. The four raw reports are complete; each format contains two distinct deals (201, 202), with all six ordered seat assignments per deal. Seat-swapped rounds are correlated. These are 24 rounds before and 24 after, not 48 independent deals.

The tactical fixtures were separate from these audit deals. Both tactical regressions failed before the change and passed afterward. No adjustment was made in response to the held-out win counts.

| Tactical position | Before | After |
|---|---|---|
| Qualifying opening with red 4,5,7,8, blue/orange 13 and a joker | Normal/Hard play 3 tiles for 39 points | Play 5 tiles for 30 points; Easy retains its previous choice |
| Group of 4s before red 1–3; rack red 4,5 | Normal fills the group and retains red 5 | Preserve the group, extend the run twice and finish |

All proposed plans passed the actual validator, all 106 physical IDs remained conserved, every completed table was legal, and planning inputs remained unchanged. Hidden-allocation and zero-budget regressions passed. Only bot/solver fingerprints changed; game, meld and tile rules stayed identical.

| Format / level | Wins before / after | Post-change p95 / max (ms) | Calls over 400 ms |
|---|---|---|---|
| mixed / easy | 0 / 0 of 12 | 0.89 / 2.7 | 0 |
| mixed / normal | 3 / 3 of 12 | 1.6 / 9.37 | 0 |
| mixed / hard | 9 / 9 of 12 | 240.11 / 244.83 | 0 |

Raw mixed: [before](BOARD_BOT_BEFORE_MIXED.json), [after](BOARD_BOT_AFTER_MIXED.json).

| pairs / easy | 0 / 0 of 8 | 1.02 / 3.52 | 0 |
| pairs / normal | 6 / 6 of 8 | 1.82 / 5.99 | 0 |
| pairs / hard | 6 / 6 of 8 | 240.09 / 241.9 | 0 |

Raw pairs: [before](BOARD_BOT_BEFORE_PAIRS.json), [after](BOARD_BOT_AFTER_PAIRS.json).

The sampled win counts were unchanged. The direct tactical tests establish the specific decision improvements; this sample does not establish a universal win-rate ranking or human enjoyment. The existing Easy/default behavior is preserved.

Timing host: Node v24.19.0 on AMD EPYC 9V74, sequential Node/Linux review at the production requested 380 ms budget with the shared 240 ms work cap. Normal p95 rose from 1.22 to 1.60 ms in mixed play and 1.31 to 1.82 ms in pairs; the extra bounded trials have a small measured cost on this host. Hard retained the work-budget headroom, with no full-call sample over 400 ms. Node timings are not physical iPhone/iPad performance or battery evidence.

The production-budget benchmark smoke also completed one seeded deal in all three seat rotations. Four new engine regressions plus the full 190-unit suite passed; browser verification uses the actual worker for both opening and rack-empty completion, including offline first use. Complete main CI remains required after publication.
