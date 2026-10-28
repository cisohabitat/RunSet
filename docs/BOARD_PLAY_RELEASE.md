# Board and play release evidence

Four approved phases are published separately and require complete exact-main
CI success before the next phase. Physical older-player/device work stays paused.

| Phase | Accepted main | Complete CI |
|---|---|---|
| Tile-sized draft cards | 9160088 | [40671169930](https://github.com/cisohabitat/RunSet/actions/runs/40671169930), success: 186 unit / 632 browser |
| Distinct visual cues | 7703915 | [40676274036](https://github.com/cisohabitat/RunSet/actions/runs/40676274036), success: 186 unit / 632 browser |
| Stronger tactical decisions | 17f71c1 | [40679394943](https://github.com/cisohabitat/RunSet/actions/runs/40679394943), success: 190 unit / 642 browser |
| Feedback and stale-motion correction | Commit containing this document | Require full exact-commit [main CI](https://github.com/cisohabitat/RunSet/actions/workflows/ci.yml?query=branch%3Amain) |

Each of the first three phases also passed six matching live bilingual journeys
on READY production. Phase 2's earlier 1f03d3e gate failed a newly added Firefox
font-fit guard; the corrected intrinsic-label implementation passed the complete
fresh workflow. Superseded/failed gates are not counted as accepted.

The [roadmap](BOARD_PLAY_ROADMAP.md) records implementation and local corrections.
The [bot review](BOARD_BOT_REVIEW.md) links four complete raw before/after reviews:
24 rounds each side across two correlated seeded deals and all ordered mixed/pair
seatings. Proposals were legal, all IDs conserved, inputs unchanged and no sampled
call exceeded 400 ms on the documented Node/Linux host. Sampled wins were
unchanged; two observed tactical regressions establish the specific improvements.
Easy/default behavior is preserved. This is not a universal strength ranking.

Phase 4 reproduced stale entrance motion before correction, then checked static
resumption, actual accepted movement, reduced motion, Undo, rejection retention,
fresh win and completed import/reopen with existing sound mocks. Full 190-unit,
type/build checks and 38 targeted local browser journeys passed (9 Chromium,
27 compatibility, 2 offline), plus the focused corrected iPad pair. The final
initial bundle is 99,269 gzip bytes with 71 precached files, below the unchanged
100,000-byte budget. Final targeted evidence and the post-publication complete workflow
are the release gate; deployment readiness alone is not acceptance.

No multiplayer, backend, new narration/autoplay, storage schema or timer rule
was introduced. Automated WebKit is not physical iOS testing. Older Chinese-
speaking player comprehension, physical Apple-device comfort, native Mandarin
voice quality and device battery acceptance remain unverified/paused.

React review retained stable physical-ID keys and memoized tiles, optional
translated descriptions, owned effect cleanup and lazy/offline result styles.
No new game state, storage writes or route-focus behavior was added by feedback.
