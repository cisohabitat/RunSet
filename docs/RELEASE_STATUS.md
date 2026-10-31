# Verified releases and publication

Use [ROADMAP](ROADMAP.md) for current scope and
[RELIABILITY_ACCESSIBILITY_ROADMAP](RELIABILITY_ACCESSIBILITY_ROADMAP.md) for
the latest approved phase work. Decision-clarity and visual/ease are complete.
This ledger records observed acceptance, not predicted success for later commits.
Historical phase documents retain their original case counts and failed-run
findings; their older matrix descriptions do not replace the procedure below.

## Verified visual/ease releases

| Phase | Exact release commit | Full CI | Matching live review | Counts at that release |
| --- | --- | --- | --- | --- |
| 1: visible Settings exit | `5d7cf80866398581dd1fb0b3fc3befea3e7ebeba` | [41001914360](https://github.com/cisohabitat/RunSet/actions/runs/41001914360) | [41002020602](https://github.com/cisohabitat/RunSet/actions/runs/41002020602) | 223 unit, 849 browser, 8 live |
| 2: returning-player clarity | `fd2c1854c5d830e5e01cf6d7435b60ccb4b5a1c1` | [41050591499](https://github.com/cisohabitat/RunSet/actions/runs/41050591499) | [41050800697](https://github.com/cisohabitat/RunSet/actions/runs/41050800697) | 223 unit, 857 browser, 24 live |
| 3: bilingual lesson recovery | `82f468741ad6d98b205a13a1a0eaa3bfc52e3747` | [41061053647](https://github.com/cisohabitat/RunSet/actions/runs/41061053647) | [41061261423](https://github.com/cisohabitat/RunSet/actions/runs/41061261423) | 223 unit, 859 browser, 24 live |
| 4: documentation consolidation | `aa83616dd6f5ccc5f1ceb12fa145d57adc0f6c75` | [41069807759](https://github.com/cisohabitat/RunSet/actions/runs/41069807759) | [41072105921](https://github.com/cisohabitat/RunSet/actions/runs/41072105921) | 223 unit, 859 browser, 24 live |

Each listed full CI and live run completed successfully for its exact commit;
matching Vercel production was observed READY before live acceptance. Earlier
failed publications are documented in the phase record and superseded by these
corrected commits. New decision-clarity phases require their own gates; these
results do not establish that a later commit passed.

The Phase 3 production build measured 99,335 initial gzip bytes against the
unchanged 100,000-byte limit, with 77 precached files. Its 859 browser cases were
341 main Chromium, 136 each in phone WebKit, iPad WebKit and desktop Firefox,
70 across two offline shards and 40 historical-upgrade cases across four profiles.
Those releases ran six connected beginner/return journeys per profile: 24 total.
The decision-clarity follow-up retains all of them and adds two bilingual
locked-opening journeys per profile: 32 live cases.

## Verified decision-clarity releases

| Phase | Exact release commit | Full CI | Matching live review | Counts at that release |
| --- | --- | --- | --- | --- |
| 1: rack-only opening guidance | `2988d5699ac3c4f30dca6dda9c206671f5dddbf7` | [41080709747](https://github.com/cisohabitat/RunSet/actions/runs/41080709747) | [41083235984](https://github.com/cisohabitat/RunSet/actions/runs/41083235984) | 224 unit, 867 browser, 32 live |
| 2: mistake recovery | `1b41fc7e0f63b10deaae321e21843d811a1416eb` | [41094208501](https://github.com/cisohabitat/RunSet/actions/runs/41094208501) | [41096842874](https://github.com/cisohabitat/RunSet/actions/runs/41096842874) | 225 unit, 875 browser, 40 live |
| 3: solo pacing review | `1a0515bde1a90e259e448b8bd103d9df8a396c6e` | [41101619354](https://github.com/cisohabitat/RunSet/actions/runs/41101619354) | [41105155839](https://github.com/cisohabitat/RunSet/actions/runs/41105155839) | 225 unit, 883 browser, 48 live |
| 4: crowded focus and found-tile visibility | `b63af0ab02b981c621ca8fd0568a35c347e0bdf6` | [41152053508](https://github.com/cisohabitat/RunSet/actions/runs/41152053508) | [41153741446](https://github.com/cisohabitat/RunSet/actions/runs/41153741446) | 225 unit, 883 browser, 56 live |

The listed Phase 1–4 CI/live runs completed successfully on their exact SHAs with
matching READY production. Phase 4's failed initial commit is documented in
[CROWDED_FOCUS_REVIEW](CROWDED_FOCUS_REVIEW.md); the corrected release above passed.

## Verified reliability/accessibility releases

| Phase | Exact release commit | Full CI | Matching live review | Counts at that release |
| --- | --- | --- | --- | --- |
| 1: startup assets and header correction | `366f6cdbceecadc8b2e8b08fbcadeee12df6d383` | [41159506733](https://github.com/cisohabitat/RunSet/actions/runs/41159506733) | [41160974451](https://github.com/cisohabitat/RunSet/actions/runs/41160974451) | 225 unit, 889 browser, 64 live |
| 2: enlargement and focus recovery | `dff9251a9760f581dce1043623312731f4ecb94f` | [41175960142](https://github.com/cisohabitat/RunSet/actions/runs/41175960142) | [41177284740](https://github.com/cisohabitat/RunSet/actions/runs/41177284740) | 225 unit, 897 browser, 72 live |

This Phase 1 gate completed successfully with matching READY production. Its
failed initial publication is documented in [STARTUP_REVIEW](STARTUP_REVIEW.md).
Phase 2 completed its entire exact-commit gate with matching READY production;
its correction history is in [ENLARGEMENT_REVIEW](ENLARGEMENT_REVIEW.md).
Phase 3 retains all 72 hosted cases and adds six correction-to-practice cases per
profile: 96 total. Expected full counts are 225 units and 921 browser cases
(355 main; 152 per compatibility profile; 70 offline; 40 upgrades). This new
commit requires its own complete exact-commit gate. See
[MISTAKE_PRACTICE_REVIEW](MISTAKE_PRACTICE_REVIEW.md).

## Release procedure

1. Finish the approved phase and update README, AGENTS and its phase record.
   Run relevant local checks. For documentation alone, inspect factual accuracy,
   local links and `git diff --check`; gameplay changes need affected-flow checks.
2. Publish to `main`. GitHub integration builds Vercel; do not deploy or promote
   through Vercel CLI. Record the published full SHA.
3. Wait for that exact SHA's entire GitHub CI workflow to complete successfully:
   quality, the original six browser jobs, four historical-upgrade jobs and the
   aggregate check (12 jobs). A passing subset, earlier commit or Vercel check
   does not establish full CI success. Preserve 20-minute job limits and each
   offline shard's five-minute step limit.
4. Inspect Vercel production and require READY with the same Git commit SHA.
   Recheck main before dispatching the live review. Run
   `gh workflow run release-review.yml --ref main -f production=true`, or create
   `codex/live-release-review/<SHA>` from that exact commit. The workflow only
   tests the existing production site; it does not deploy or promote.
5. Require the exact-SHA Release review to finish successfully in all four
   profiles, with all 96 live cases. Recheck main and production still match;
   report the commit and both run links before beginning the next phase.
   Fix failures and repeat the complete gate on any correction commit.

The workflows are defined in [ci.yml](../.github/workflows/ci.yml) and
[release-review.yml](../.github/workflows/release-review.yml). Browser profiles
are configured in [playwright.release.config.ts](../playwright.release.config.ts).
Run local browser suites sequentially when their build or artifact roots overlap.
Historical upgrade fixtures require a full-history checkout and pinned sources;
see [UPGRADE_COMPATIBILITY](UPGRADE_COMPATIBILITY.md).

## Evidence limits and deferred work

Automated viewports and WebKit profiles do not establish physical iPhone/iPad
Safari usability. Logical expiry and week-away checks do not establish physical
mobile suspension behavior. Constructed near-win imports establish the ending
connection, not a fully played fresh random round; separate match evidence lives
in [MATCH_REVIEW](MATCH_REVIEW.md). Audio automation establishes playback/control,
not Mandarin pronunciation, cheerful delivery or older-player enjoyment.

Physical Apple checks, older Chinese-speaking beginner sessions and native
Mandarin listening remain paused. Multiplayer remains deferred. This ledger
does not approve a new feature cycle or change rules, bot budgets, tile sizes,
native touch targets, board floors, storage formats or bundle limits.
