# Upgrade compatibility

Baseline: 3c04486, full CI 40983640662 passed (223 units / 809 browser cases),
matching READY production and ten passing live checks. This phase verifies
older progress through native application/worker upgrades. Physical Apple,
older-player and native Mandarin studies remain paused; multiplayer is deferred.

## Demonstrated defect

The worker searched all retained caches before its own version's cache. A native
upgrade from 6effa7a successfully installed/activated the current client offline,
but a stable test asset URL returned the old release SHA instead of candidate.
The current cache was complete and the old progress was retained: the failure
was asset precedence, not a failed installation or a lost save.

Asset requests now check the active CACHE first, then fall back to retained
caches for older hashed modules, then the network. Navigation keeps its own
current-index fallback. Previous-cache retention, install cleanup, cache checks,
explicit acceptance and save-before-activation/reload behavior are preserved.
A stable URL such as a manifest or recording can therefore use the new cached
content while an unrefreshed old tab can still load its old hashed chunks.

## Historical sources and scope

| Source | Reason |
|---|---|
| 6effa7a12b9be88072a3cf4dc94c4cc78f8be2c3 | Original whole-turn record without lesson/layout fields |
| 26f3518ef67037385ab201bfea7ac961dba65b10 | First portable profiles and learning/display transfer |
| 3c044868ecc5bb8584c119aac333fafe5e51177e | Recent refined release before this worker fix |

The builder archives those exact commits and rebuilds their app sources and
worker logic. All three package-lock files are byte-identical to the current
locked dependency graph; a mismatch fails instead of silently building with
new dependencies or substituting current code. A separately bundled historical
engine supplies the constructed 106-tile regular control. It is not a claimed
naturally dealt/fully played match. Actual progress is then created through each
old client: a regular draft, a short-lesson group, a whole-turn opening with
hidden prompts, and a completed extension exercise/solo record. Pace is changed
through historical Settings; initial language, reading, mute and view flags are
explicit test preferences. Profiles are downloaded through the old native UI.

One labelled test-only shared asset is added before each side runs its own
worker generator, allowing changed content at the same URL to be distinguished.
This changes fixture cache identity but not historical app/worker logic. A
separate recent-release worker-only case uses identical old assets/cache identity
and changed current worker code. It interrupts installation, proves the existing
cache survives, retries and accepts offline. Fixtures stay under ignored
test-results; no historical app, probe or fixture HTML is shipped in public/dist.

## Native browser journeys

Each language runs three direct historical upgrades, an interrupted recent
upgrade and the worker-only interruption/retry: ten cases per browser profile,
40 across Chromium, WebKit phone, WebKit iPad and Firefox desktop.

The checks retain every preexisting runset key byte-for-byte across discovery
and acceptance. Newly initialized values are allowed only for explicitly listed
current defaults; unexpected additions fail. The original deadline and all 106
IDs remain intact. Learning does not replace the regular game. No update check
may activate/reload before explicit acceptance, and the other open tab does not
navigate. After a failed install, cache keys remain exactly as before, and the
old client reloads offline before retrying.

After acceptance offline, the app entry and shared cache probe match the intended
candidate. Older hashed JS is fetched by its actual SHA-256 through the new
controller while offline, and the still-open old client loads its lesson. The
current client then performs real Undo, retains/completes the old exercise/solo
record, continues the short lesson and finishes the whole-turn opening. Older
portable profiles import through current native review/confirmation with game
replacement unchecked; the current regular position remains intact. All four
learning records are covered, including the original missing lesson/layout form.

The clock is fixed for deterministic deadline preservation. This is not physical
mobile suspension evidence. Three pinned releases and constructed controls do
not prove compatibility with every possible historical or malformed save.
Existing rejection/recovery and timed-expiry regressions remain required.

## Local/CI and live verification

```sh
npm run test:upgrade
# Limit a prepared run to one browser:
npx playwright test --config=playwright.upgrade.config.ts --project=chromium
```

Use a full-history checkout and installed Playwright browser dependencies. CI
checks out full history for the four bounded upgrade jobs. Each builds its own
current/historical artifacts and runs ten cases with one worker. Existing
Chromium, three compatibility projects and both offline shards remain unchanged.
The aggregate check now depends on all twelve jobs. Expected totals: 223 units,
809 original browser cases plus 40 upgrade journeys = 849 browser cases.

Historical source trees are removed after building. This prevents broad test
globs from collecting old specs and excludes node_modules/source archives from
failure uploads; artifacts include browser reports and fingerprint metadata only.
The generated manifest records pinned sources, lock hash, worker hashes and
cache identities. Local suites sharing output/build folders run sequentially.

The connected release/live workflow additionally seeds a labelled prior cache
in a fresh browser context, installs the real current worker and checks the
actual production manifest offline. The prior cache is retained while the
current manifest wins. An inert routed setup document avoids JSON-download
behavior differences between browsers; it is test-only. This live cache check
is distinct from the historical native upgrade fixture suite. Matching
production READY and complete exact-commit CI/live runs remain release gates.

Local release checks passed: 223 units, all ten historical Chromium journeys
through the documented command, two connected bilingual cache-priority journeys
and both complete offline shards (35 + 35). The production build remains 99211
initial gzip bytes against the unchanged 100000-byte budget, with 77 files.
Cross-browser historical acceptance and matching live deployment checks must
pass on the published commit; local Chromium is not physical Apple evidence.
