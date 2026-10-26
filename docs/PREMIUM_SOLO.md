# Numbered solo puzzles

Quick exercises now accept a puzzle number from 1 to 999999. The same number and
exercise reproduce the same initial tiles, rack order and known legal goal.
New puzzle number chooses another number; Restart exercise replays the current
one. Number 4321 preserves the original fixtures and their saved sessions.
Changing a number never replaces the regular game or the guided tutorial.

The seeded generator permutes colours and safe number ranges for openings,
extensions, gap repairs and joker replacement/reuse. It rebuilds the physical
deck and copied turn/history snapshots. Full-turn validation still decides
success. Different numbers can produce the same visible exercise; this is a
small family of teaching problems, not a claim of 999999 distinct challenges.
Clues and captions use actual transformed tile IDs and values. Dynamic captions
use device speech when no exact bundled recording exists.

`runset.solo.v1` stores up to 200 deduplicated completion keys and the four
exercise-kind milestones. Its deterministic bounded union merges completions
across tabs. It is not an ordered history. Replaying a retained completion does
not increase the count. Kind milestones remain even when the bounded key list
fills. Records are local to the browser, without accounts, streaks or telemetry.
Malformed records show a recovery notice; failed writes leave play available.
Deleting regular game progress preserves these independent exercise records.

Verification samples 100 numbers per exercise (400 positions), including both
bounds and the legacy number. Every position reproduces, conserves all 106 IDs,
validates as a save and reaches a legal goal through real reducer moves. Tests
also check translated dynamic captions, incomplete joker reuse, progress bounds,
deduplication and merge convergence. Phone/iPad-sized browser flows cover all
four goals, Reset, replay, invalid input, resume, milestones, damaged records,
quota failures and regular-save isolation. Production offline coverage includes
a previously unopened numbered puzzle and its local completion record.

These exercises are solo only. Bot difficulty and multiplayer are unchanged.
Physical Apple-device and older-player studies remain paused.
