# Phase 4: results and replay

Phase 3 was published separately; GitHub CI run 40295547425 passed before this
phase began. Phase 1 human/device testing remains paused by the user.

## Player-visible changes

Results explain the round's ending: someone emptied their rack, or the pool was
empty and everyone passed consecutively. Blocked rounds identify the lowest
remaining total and explain a seat-order tie-break when necessary. Completed
saves without enough ending evidence say the exact ending was not recorded.

Score cards distinguish a round score from remaining rack value. A scoring panel
explains number values and the 30-point value of each remaining joker. The
winner's actual addition is visible, and expandable details show every remaining
tile and its arithmetic. For example, 4 + 7 + Joker (30) = 41 gives that player
−41; if the other losing rack totals 3, the winner earns 41 + 3 = +44. In a
blocked round the winner's own remaining rack is not deducted, matching the
existing engine rules. No scoring or winner-selection rules changed.

- **Play again with same settings** starts a fresh round or match using the same
  human name, opponent count, difficulty, target, turn length and coaching choice.
- **Change settings** preloads those options in setup for editing.
- In an unfinished match, **Deal round N** keeps accumulated scores; **Start over
  with same settings** starts a new match with zero totals.
- Replacement still requires confirmation. Cancel preserves the exact saved
  result. A fresh timer begins on acceptance, not when the dialog opens.
- Restoring an imported backup keeps its original progress and deadline; it does
  not receive the fresh-game/zero-score confirmation text.

Display, language, sound and other preferences remain in place. Long names and
large remaining racks wrap on phones. Results remain a separate offline-cached
chunk; the Chinese translation matcher also loads with its dictionary to keep
the initial HTML and referenced CSS/JS below 100,000 bytes gzipped.

## Verification

- Strict type checking, 90 unit tests and the production build pass.
- Seven new helper tests cover actual rack-empty/blocked finishes, ties, unchanged
  state/scores, missing end evidence, translated messages with literal names, and
  both enabled and disabled replay options.
- 60 browser flows pass. Nine new flows verify both languages at phone, tablet
  and desktop sizes, light/dark and comfortable/compact modes; actual joker
  arithmetic; cancellation; prefilled settings; updated timer/target choices;
  match continuation and reset; a completed match; and importing an active backup
  over a completed result. A long-name/104-tile case checks wrapping.
- Seven production offline flows pass. The new flow disconnects before the first
  results visit, opens score calculations and starts a same-settings replay.
- Screenshots were inspected in English and Chinese, light and dark. Important
  result actions are hit-tested before clicking.

Actual iPhone/iPad Safari, assistive-technology and older-player comprehension
checks remain unverified/paused. Mandarin audio and the larger difficulty study
are later roadmap phases and are not claimed as shipped here.
