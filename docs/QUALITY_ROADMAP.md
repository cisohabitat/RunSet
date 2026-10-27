# Follow-up quality cycle

All three phases are authorized. Publish each to `main`, then wait for exact-commit
GitHub CI (including browser, offline and benchmark checks) before starting the
next phase. Keep README and AGENTS guidance aligned with findings and fixes.

| Phase | Status | Deliverable |
| --- | --- | --- |
| 1. Bot difficulty audit | Implemented | Fresh 30-deal, all-seat mixed and paired production trials; original-plan legality, timing, seed-block results and honest difficulty guidance. Strengthen CI benchmark proposal checks. |
| 2. Accessibility audit | Implemented | Keyboard completion, focus, labels, contrast and enlarged-text checks in both languages; fix verified barriers. |
| 3. Performance and recovery | Queued | Crowded boards, long games, interrupted saves and offline-update failures; fix verified defects and preserve saved progress. |

Physical iPhone/iPad sessions, older-player studies and native Mandarin listening
remain paused. Automated Chromium tests cannot replace those results. Multiplayer
remains deferred. The [premium cycle](PREMIUM_ROADMAP.md) remains completed through
its seven automated phases, with human acceptance paused.

Phase 1 completed 360 production-budget rounds / 39,212 turns with zero rejected
plans and zero measured calls over 400 ms. See [audit findings](QUALITY_BOTS.md).
The exact-commit CI release gate must pass before Phase 2 starts.

Phase 1 correction `01b24db` passed [CI 40423008180](https://github.com/cisohabitat/RunSet/actions/runs/40423008180)
before Phase 2 began. [Accessibility corrections](QUALITY_ACCESSIBILITY.md) add
landmarks, readable warning/rules copy, screen/lesson focus and keyboard/reflow
regressions. Phase 2 exact-commit CI gates performance/recovery work.
