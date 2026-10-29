# Endgame decisions: witnessed repairs

Hard could pass on a legal crowded board despite a rack-empty move: take blue 7
from a four-colour group of 7s, keep the other three 7s together, and play blue
6/7/8. With 96 public tiles, whole-board candidate generation exhausted its work
before finding this small repair. The independent literal witness passes the
actual reducer, turn validator, physical-inventory and save checks. Both meld
orders failed the original unit regression.

Hard now probes individual relevant melds, smallest first, with at most eight
unplayed rack tiles. It compares every proposal against the same legal baseline
and preserves the baseline's already-played rack tiles and untouched melds. This
avoids committing a partial repair that hides a later complete finish. Every
candidate passes the full turn validator, including original joker obligations.
New IDs avoid all retained meld IDs. Timeout keeps the best validated plan.

The local probe first tests simple one-tile transfers directly, for up to 10 ms
of its shared 35 ms. Generic probes then use at most 6 ms per meld, inside the existing
240 ms overall work cap / 380 ms requested production budget. Whole-board search
retains the remaining budget. Easy/default and Normal behavior are unchanged.
Hints using the Hard planner also receive these validated repairs. No rules,
save schema, timer, display size, dependency or CI limit changes.

## Explicit tactical evidence

| Position | Original Hard rack tiles played | Revised | Revised full-call ms |
|---|---:|---:|---:|
| Crowded borrow plus existing legal extension | 1 of 3 | 3 of 3 | 3.62 |
| Crowded borrow | 0 of 2 | 2 of 2 | 1.21 |
| Same crowded table in reverse meld order | 0 of 2 | 2 of 2 | 1.30 |

The small-table borrow, duplicate interior-run split and exact joker replacement/
reuse controls also finish. Below-30 unopened and missing-joker-replacement
controls still pass without playing. Eleven unit regressions additionally check
106 IDs, valid saves, unchanged inputs, zero-budget fallback, unchanged Easy/
Normal, hidden-allocation redaction and existing-ID collisions.

The audit rejects any unmet tactical objective before starting longer games.
These fixtures stress legality and complexity; the unusually crowded 96-tile
board is not claimed to be a typical human game.

## Separate deal audit

[Raw audit](ENDGAME_AUDIT.json), measured for initial publication a302308, retains the host, source and baseline-bundle
fingerprints, assignments, endings, recorded final-pass positions, bounded
witnesses and full-call latencies. Baseline is public commit 2ef9269. Discovery
deals 61001–61004 were separate from final verification deals 62001–62004. No
heuristic was adjusted to sampled wins.

The final verification contains 24 mixed and 24 paired rounds: four deals per
format, all six mixed seat orders and both orders of each pair. Seat-swapped
rounds are correlated; these are not 48 independent deals. Baseline endings were
46 blocked and two rack-empty. The current planner is checked on the same 115
recorded final-pass positions; it does not replay changed round trajectories.
Consequently those ending counts are not presented as revised-bot results.

| Level | Final pass positions | Racks within witness scope (≤8) | Validated move witnesses | Revised planner found a play |
|---|---:|---:|---:|---:|
| Easy | 39 | 0 | Not checked | Not checked |
| Normal | 38 | 30 | 21 | 0; existing non-rearranging style retained |
| Hard | 38 | 32 | 24 | 24 |

In all 24 witnessed Hard positions, the revised planner played at least as many
rack tiles as the constructive witness. All submitted baseline/current plans
and witnesses passed validation before reducer fallback; all 106 IDs remained
conserved and planning inputs stayed unchanged. Independent report checks
confirmed complete seed/seat coverage, final-pass cycle counts, tactical outcomes
and current source fingerprints. Redacted diagnostic states are not game backups.

Witness patterns cover pair additions, moving one public tile into a new meld,
and duplicate-run splits. They are not an exhaustive global solver. No witness
does not prove that no legal move exists. This final held-out sample supplied
zero known rack-empty witnesses: finish coverage comes from the six separate
positive tactical fixtures, not a claimed perfect finish-recall rate.

## Timing and verification

Node v24.19.0/Linux on AMD EPYC 9V74, sequential audit with start load and visible
CPU count in the raw report. First-publication Hard calls over the 38 final-pass positions:
p50 240.02 ms, p95/max 240.27 ms; zero over 400 ms. Original Hard's 1,746 full-round
calls had maximum 242.52 ms, also zero over 400 ms. Witness work is outside planner
timing. Time-bounded decisions can vary with host load even on seeded deals.

[Production benchmark smoke](ENDGAME_BENCHMARK.json) separately uses one seeded
deal in all three seat rotations at 380 ms. It checks original proposals,
conservation, completed games, hints and full-call timing. It is not strength
ranking evidence. Unit/build and actual-worker browser checks are required
alongside the audit, followed by complete exact-commit CI before release.

The connected browser journey resumes the crowded fixture, runs the actual
worker, accepts a legal rack-empty turn, persists Results and verifies the other
hand, empty pool, latest-play IDs, accessibility and runtime errors. Both
languages run in Chromium and first-use offline WebKit phone/iPad and Firefox.
No API or backend exists in this static game. These checks do not establish
physical Apple speed, battery life, native Mandarin approval or older-player
enjoyment; those studies remain paused. Multiplayer remains deferred.

All 218 units and the production build/typecheck passed. Initial gzip size is
98,713 bytes under the unchanged 100,000 budget, with 77 precached files. All
five focused Chromium cases and all 12 offline compatibility cases passed,
including the existing opening/extension decisions and delayed-worker controls.
Reviewed English phone/light and Chinese iPad/comfortable/dark result captures.
The documented baseline-build recipe reproduced the recorded bundle hash.
Complete exact-commit CI remains the publication gate.

## Cold-run correction

Initial a302308 failed CI 40867855167 in the combined extension/borrow control;
217 other units passed and browser jobs were skipped. The generic six-millisecond
slice could expire before reaching that literal transfer on a cold runner. No
assertion or CI timeout is relaxed. The correction tests that inexpensive
one-tile transfer before generic enumeration, within the same 35 ms local and
240 ms overall caps. Full turn validation still protects joker changes.

[Final cold check](ENDGAME_COLD_CHECK.json) rechecks all 24 witnessed Hard
positions from the complete audit, and all eight tactical controls, with fresh
source fingerprints. Public tables/own racks are the original recorded inputs;
unseen allocations are reconstructed only to check all 106 IDs and redacted
again before planning. They are not historical hidden racks or new game results.
All 24 plays meet or exceed their literal witnesses, and all tactical objectives
pass. Rechecked Hard p50 is 240.02 ms, p95 240.06 ms, maximum 240.07 ms, zero over
400 ms. The original full audit remains tied to its measured a302308 source;
the targeted recheck, full unit simulations, fresh production benchmark and
actual-worker browser checks validate the correction without repeating unchanged
baseline game trajectories. All 218 units passed again; require fresh full CI.
The final production-budget benchmark passed with maximum Hard call 242.36 ms,
all proposals/hints legal and all physical IDs conserved. Build/typecheck stayed
at 98,713 initial gzip bytes / 77 cache files. All five focused Chromium and 12
offline compatibility cases passed again, including the delayed-worker controls.

## Reproduction

For a current-planner diagnostic without an earlier baseline:

```sh
node scripts/review-endgame.mjs --seeds=4 --first-seed=62001 --out=/tmp/endgame-current.json
node scripts/review-endgame.mjs --recheck=docs/ENDGAME_AUDIT.json --out=/tmp/endgame-cold-check.json
```

For the original baseline, create an SSR bundle from its public source revision
using the current locked Vite installation, then supply that module explicitly:

```sh
task_baseline=$(mktemp -d /tmp/runset-endgame-base.XXXXXX)
git archive 2ef9269 src/engine scripts/benchmark-entry.ts | tar -x -C "$task_baseline"
RUNSET_ENDGAME_BASE="$task_baseline" node --input-type=module <<'JS'
import { build } from 'vite';
import { join } from 'node:path';
const root = process.env.RUNSET_ENDGAME_BASE;
await build({root, configFile:false, logLevel:'error', build:{
  ssr:'scripts/benchmark-entry.ts', outDir:join(root,'bundle'),
  emptyOutDir:true, minify:false,
  rollupOptions:{output:{entryFileNames:'engine.mjs'}}
}});
JS
node scripts/review-endgame.mjs --seeds=4 --first-seed=62001 --baseline="$task_baseline/bundle/engine.mjs" --baseline-ref=2ef9269c9104203b0d8250948d158ca940449c26 --out=/tmp/endgame-before-after.json
```

`--baseline-ref` labels the supplied module; it does not fetch or build it. The
report records its actual bundle hash. Keep full audits sequential with other
CPU/browser workloads, and inspect `complete` before using checkpoint reports.
