# Startup asset review

Phase 1 of the [reliability and accessibility cycle](RELIABILITY_ACCESSIBILITY_ROADMAP.md).
Baseline: `b63af0ab02b981c621ca8fd0568a35c347e0bdf6`, verified by complete
[CI 41152053508](https://github.com/cisohabitat/RunSet/actions/runs/41152053508)
and [56 hosted checks](https://github.com/cisohabitat/RunSet/actions/runs/41153741446).

## Measured change

| Measure | Baseline | Candidate |
| --- | ---: | ---: |
| Initial HTML and referenced CSS/JS, gzip | 99,422 bytes | 98,671 bytes |
| Headroom under the unchanged 100,000-byte limit | 578 bytes | 1,329 bytes |
| Offline precache files | 77 | 80 |

Initial assets shrink by 751 gzip bytes (0.76%); budget headroom is 2.30 times
the baseline. The additional three files are stylesheets for already lazy-loaded
Settings, setup and rules screens. React dominates the startup JavaScript; no
runtime dependency, package lock, React version or game-state ownership changes.

The three screen styles move from the initial global stylesheet into their
component imports. Vite loads the CSS before resolving each lazy screen. Selector
specificity, declarations, responsive conditions and internal order are retained.
Shared settings-heading rules remain global because RackOrganizer also uses them.
Shared page, button, tile, theme, gameplay and results rules remain global.
The setup-dependent App header rule also stays at its original global position,
before the narrow-screen header reflow override.
An independent CSS parse comparison preserved all 1,055 selector/declaration
records, including their media and keyframe contexts.

This reduces the initial render's required asset set. The service worker still
precaches every screen asset for first-use offline play, so this is not a claim
that the complete offline installation downloads fewer bytes. Startup timing
and physical-device speed improvements are unmeasured.

## Verification

Two new bilingual production-browser cases hold each screen's actual stylesheet
response in turn. Home initially has none of the three screen stylesheets
attached. While CSS is held, the existing loading UI remains visible, the screen
has not rendered, and exact regular-save bytes stay unchanged. Releasing CSS
reveals the styled screen; native Done/Back/Home actions return safely. Check
actual Settings flex/scroll styling, setup choices and rules grid/borders, focus
return, complete >=44 px native targets, centre hits and runtime errors.

These cold-load cases deliberately block service workers, isolating document
loading from background precaching. All earlier first-use offline journeys and
cache/upgrade checks remain required. No old assertion, timeout, offline shard
or CI job is removed or relaxed. Expected counts are 225 units and 889 browser
cases (347 main, 144 per compatibility profile, 70 offline and 40 upgrades).
The new cases also join every hosted profile: 16 each, 64 total.

Initial local production visual journeys passed in both languages before and
after extraction. They cover setup, rules, lessons, exercises, gameplay and
Settings at 320/1180/1440 in standard/comfortable reading, including first offline
visits, native exits, exact save isolation and Axe checks. Computed-style
captures were compared; auxiliary offline-status heights varied between runs,
so whole-screen pixel identity is not asserted. Initial local acceptance passed both cold-CSS cases in Chromium and all four
cold-CSS/offline-visual cases per WebKit phone, WebKit iPad and Firefox. The
existing nine slow-screen/loading cases and four 4× CPU responsiveness cases
also passed. Across forty move/Undo render samples, the largest observation was
388.80000001192093 ms against the unchanged 1000 ms smoke bound. These are local Chromium dev
build touch-layout measurements, not startup timings, a population percentile
or physical-device results. Raw cases, bundle asset sizes and source fingerprints
are retained in [STARTUP_REVIEW_SAMPLES.json](STARTUP_REVIEW_SAMPLES.json).

## Initial publication and header correction

Initial commit `1b37e7c1f7c7f10e0f43dd61601ba3c2569a90b6` failed
[CI 41157934469](https://github.com/cisohabitat/RunSet/actions/runs/41157934469).
Chromium and WebKit phone connected beginner journeys found English setup
header controls at
y=60–104 px outside their header bounds. Moving the setup-dependent App header
height into lazy CSS made it override the later global mobile reflow rule.
Returning that shared header rule to its original global position fixes the
demonstrated ordering error. Cold-CSS tests now also check complete header
control bounds after every delayed screen reveal. Existing connected header
assertions, target sizes and timeouts remain unchanged. The initial commit was
not reported verified. Final local checks then passed both main beginner
journeys, all 16 Chromium production release cases, and four connected/CSS
cases each in WebKit phone, WebKit iPad and Firefox. The four CPU-throttled
cases were rerun successfully against the correction; the retained forty samples
and source fingerprints describe this corrected candidate. Its own complete
release gate remains required.

Full exact-commit twelve-job CI and matching READY production/hosted acceptance
are required before publication is reported verified. Physical Apple checks,
older-player sessions and Mandarin listening remain paused.
