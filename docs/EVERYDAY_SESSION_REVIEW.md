# Extended browser-session review

Phase 5 found and fixed a real destination overlap. In standard regular play,
Firefox native scrolling from a lower selected tile could place the first meld
destination behind the sticky decorative table heading. Both English timed and
untimed journeys failed their original centre hit test before the fix. The
direct regular-game heading now scrolls with melds. Practice scope, tile/control
sizes, visible board floors, saves and engine rules remain unchanged.

After the fix, all 16 new primary cases passed: two languages × timed/untimed ×
Chromium phone, WebKit phone, WebKit iPad and Firefox desktop. All 12 production
compatibility cases disconnect before the session. Four additional offline
production Chromium cases passed too. The existing 13 landscape/table-overview
cases and all 207 units passed. Production build/typecheck passed: 98,703 initial
gzip bytes before the scroll-edge correction below; the corrected build is
98,708 bytes, under the unchanged 100,000 budget, with 77 precached files.

## What the sessions check

- Start with 100 valid copied Undo snapshots. Untimed sessions make 121 real
  moves; timed sessions make 13. Use visible tiles/destinations and native input,
  preserving full target geometry and centre hit tests. At checkpoints compare
  actual persisted state to an independent reducer expectation, validate all
  snapshots, conserve 106 physical IDs and require the 100-snapshot cap.
- Rotate to the opposite orientation and back with a selected tile. Keep exact
  saved bytes and selection. Then check expanded visible table space: at least
  300 px on comfortable phones, 450 px on comfortable iPad and the existing
  180 px standard minimum. Restore Standard before leaving play.
- Refuse only the primary game write. Keep the previous saved bytes and live
  edit, show Not saved, refuse Take a break, then restore writes and retry that
  real action. Reload offline in production cases, resume and actually Undo.
  The persisted history then has 99 snapshots and the expected draft.
- Timed cases spend 20 minutes of logical elapsed time on Home. Saved bytes and
  the original deadline stay unchanged there. Continuing expires exactly one
  turn: restore the turn-start table/rack, draw one pool tile, clear Undo and
  advance once. Leave play before the separately paced bot callback.
- Untimed cases import three different valid playing backups through the native
  file control and replacement confirmation. Actually play the rack empty, end
  each round and await Results plus history counts 1/2/3. Initial completed saves
  would not exercise recording. The 20 local cases made 30 actual completions,
  including six in the additional production Chromium run. These are synthetic
  fixtures, not independent human games or a 30-record retention-cap test.

All cases retain Axe, horizontal-bound and runtime-error checks. Chinese phone
and iPad dark/comfortable captures and English phone captures were reviewed.
No assertion was weakened and no forced click or test-only repositioning hides
the Firefox failure. The complete existing offline suite stays in its two
five-minute shards; additional long offline coverage belongs to compatibility.

## Retained resources and native lifecycle

[Raw samples](EVERYDAY_SESSION_SAMPLES.json) record 20 passing local cases,
browser versions, host, source fingerprints and the actual heap/DOM checkpoints.
Untimed Chromium samples follow forced GC at the same editing arrangement after
1, 61 and 121 accepted moves, with Undo already at its cap. Results/other lazy
screens load after those samples so their different markup is not compared.

| Build / language | Heap at 1 move | Heap at 121 moves | Growth MiB | DOM nodes before / after | Listeners before / after |
|---|---:|---:|---:|---:|---:|
| Development / English | 8,312,600 | 9,977,112 | 1.59 | 1440 / 1440 | 293 / 293 |
| Development / Chinese | 9,047,956 | 10,775,936 | 1.65 | 1440 / 1440 | 293 / 293 |
| Production / English | 4,975,592 | 6,270,668 | 1.24 | 1486 / 1486 | 300 / 300 |
| Production / Chinese | 5,494,256 | 6,840,708 | 1.28 | 1486 / 1486 | 300 / 300 |

All samples retained one document. Growth stayed within the explicit 8 MiB /
150-node smoke bounds. Positive heap growth is reported, not called zero leakage;
this finite session cannot establish indefinite leak freedom. Measurements are
renderer JavaScript heap, not total browser/process/GPU memory. Local suites
overlapped on one Linux AMD EPYC host; elapsed test duration is not a performance
benchmark. Chromium was 154.0.8037.57, WebKit 27.2, Firefox 157.0.

The four untimed Chromium profiles also exercise native frozen → active lifecycle
with a deliberate 500 ms dwell and exact draft-byte checks. WebKit/Firefox do not
claim that protocol coverage. Timed cases use logical Home time instead. Neither
exercise establishes physical Safari suspension behavior, device battery life,
older-player comprehension or native Mandarin quality; those studies stay paused.

Reproduce primary coverage with the normal main/compatibility configs and
`extended-session.spec.ts`. For the additional production Chromium audit:

```sh
npm run build
npx playwright test --config=playwright.session.config.ts
```

That optional config reuses the existing production preview and connected
compatibility tests, with one worker and a 375×667 touch profile. The required CI
matrix retains every original job and gains four main plus four cases in each
compatibility project (16 new cases total). Complete exact-commit CI, including
both offline shards and aggregate check, remains required before final handoff.

## Publication gate correction

Initial publication d0fe8f6 failed CI 40804829556 in one new Chinese comfortable
Chromium case: More's immediate hit-target probe failed after reload/Undo.
The other 328 main cases, all 124 cases per compatibility project, both 35-case
offline shards and all 207 units passed. The aggregate gate correctly failed.
All 12 live release journeys also passed on matching READY d0fe8f6; that does not
override the failed CI gate. Three unchanged-assertion local repeats using the
bundled Chromium passed, so a persistent additional application defect was not
reproduced.

The test now awaits visible Saved feedback as well as the actual persisted
state, then waits for full original target geometry after native scrolling.
The polling callback only measures: it never scrolls or repositions the target.
Every size, complete viewport-bound and native centre-hit requirement remains,
with detailed box/hit diagnostics and the existing assertion timeout. A permanent
covered/clipped destination still fails. No application code, CI case, assertion
or job/step limit is removed/relaxed. Resource samples retain their measured
helper fingerprint from the earlier local run; application assets are unchanged
by this readiness-only correction. Require fresh complete exact-commit CI.
All eight corrected local cases passed with bundled Chromium 156.0.8078.4:
both languages/timer modes repeated twice with two concurrent workers. The
earlier three diagnostic repeats passed too. These do not replace the fresh gate.

## Persistent native scroll edge

Readiness-only d7d024b failed CI 40807269770 at the same More summary after the
full five-second wait; every other job and case passed again. Waiting was not
sufficient. Replaying the failed snapshot at 375×667 with DejaVu fallback metrics
reproduced native scroll rounding: More ended at 667.40625 px, just outside the
667 px viewport. The target centre was clickable, but its complete target was
clipped. The strict assertion correctly continued to reject it.

A 12 px block scroll margin brought the same native-scrolled target to
655.40625 px. The application now gives More this margin, matching the existing
primary-action convention. There is no target shrink, geometry tolerance,
test-only repositioning or timeout increase. Chinese untimed journeys now use
DejaVu/Noto system fallback metrics on every reload to retain this regression
locally and across all compatibility projects. No font asset is added to the app.
The earlier resource file retains its original measured source fingerprints;
it predates this scroll-margin change and the new fallback-font test fixture.
Require a fresh complete exact-commit workflow for this actual edge correction.
All eight local bundled-Chromium cases passed with the margin, including both
Chinese fallback-font repeats (two concurrent workers, both timer modes and
languages). Offline compatibility and the complete publication workflow remain
required; the previous failed runs are not acceptance evidence.
All 12 offline compatibility cases subsequently passed with the margin and
fallback fixture too. Complete fresh publication CI is the final remaining gate.
