# Phase 3: clearer first-game actions

Phase 2 was published separately and GitHub CI run 40292228237 passed before this
phase began. Phase 1 human/device testing remains paused by the user.

## Changes

New-game setup has **Show first-game guidance** enabled by default, with an opt-out.
Older games retain their own coaching state. The card now follows the current
selection and table: choose a destination, add more opening points, fix an
incomplete group, reset safely, or end a valid turn. In compact phone layouts the
card temporarily takes the space of opponent cards; dismissing it restores them.
Comfortable reading retains the full flowing layout.

End turn has an associated explanation: play a rack tile first, keep editing to
avoid a penalty, or finish the valid turn. During beginner guidance this is also
explained by the visible next-step card; when guidance is off a compact text line
remains. The explanation stays linked for assistive technology while a hint is
open. Empty pools consistently recommend Pass. **More → Reset, Draw and Pass
explained** distinguishes free rollback, drawing and ending a turn, and passing.

Selected tiles outline destinations only when that hypothetical move leaves a
complete valid turn. The helper applies the existing reducer and validator to
copied temporary state, omitting Undo snapshots during inspection. It respects
30-point openings, invalid source groups, and joker replacement/reuse. It changes
no game state and reveals no bot rack information. Highlights are suggestions:
intermediate edits, multi-step rearrangements, and the final End-turn validation
remain available as before. Keyboard and touch destinations are unchanged.

Setup is loaded separately and included in the offline precache, preserving the
existing 100,000-byte initial gzip budget. Bot planning, difficulty, move legality,
penalties and persistence schemas are unchanged.

## Verification

- Type checking, the production build and 83 unit tests pass.
- Seven new pure-helper tests cover opening thresholds, source validity, joker
  replacement/reuse, no mutation, safe finish explanations, unavailable/bot/over
  states and Chinese copy across the message states.
- 51 browser flows pass. Four new flows cover selection/destination highlighting,
  6/30 progress, resetting without loss, penalty cancellation, full phone
  instruction bounds, new-game coaching opt-out and an empty-pool explanation.
- Existing laptop Hint/Expand/Compact tests retain complete meld tiles and controls.
  Existing compact/comfortable and bilingual lesson flows still pass.
- Six production offline tests pass, including first-ever setup after disconnecting
  and starting a guided game.
- English and Chinese phone screenshots were inspected. Physical Safari,
  assistive-technology and older-player study checks remain paused/unverified.

The remaining roadmap phases are planned in ROADMAP.md; this phase does not claim
new results explanations, Mandarin audio or a larger difficulty study.
