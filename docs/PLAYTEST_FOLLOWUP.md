# Playtest follow-up — 26 October 2026

This addresses the three priority findings in the user-supplied live playtest
report. Its five completed rounds are independent playtest evidence, not rounds
repeated by this change or evidence of difficulty rankings. The original report
and its referenced local evidence are not copied into this public repository.

| Finding | Reproduced before the fix | Change and verification |
| --- | --- | --- |
| RS-01: hint compresses the table | At 1180×757, the populated board measured about 134–136 px with a no-move hint open. | Reserve 220 px for a populated board on laptop/desktop viewports at least 700 px tall. Compact no-move hints; temporarily hide opponent cards while that hint is open on short desktop screens. Regression checks cover normal/large tiles, complete meld bounds, readable heading, dock separation, Expand/Compact and restoration after Dismiss. |
| RS-02: empty pool still says Draw | Both unopened and opened no-move hints recommended drawing with an empty pool. | Say Pass in empty-pool hints, coaching, timer help and planner fallback messages. Unit checks cover both opening states; a browser check verifies Hint/Pass/timer agreement and passing without adding a tile. |
| RS-03: optional completion is unclear | Neither optional lesson had explicit success copy or a retained final table; the joker intermediate step kept the original instructions. | Add an intermediate Reuse the table joker step explaining that it stays on the table as red 7. Give both lessons explicit completion headings, an explanation of the successful move, and a read-only finished table with valid meld captions. Verify phone/laptop completion, reload/resume, restart and regular-save isolation. |

Keep the existing rules, free Reset, penalty confirmation, autosave, match scoring
and worker planning budgets. This follow-up changes layout, learning and guidance;
it does not change move legality or the draw/pass state transition.

The report's preference suggestions about Play again defaults and explaining the
round-ending cause remain separate product decisions. Difficulty balance still
needs a larger study. Physical mobile/Safari, assistive technology, and the
report's unverified interactions are not certified by these automated checks.
