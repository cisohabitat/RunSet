# Focused learning

Home’s Quick exercises opens four independent, untimed challenges: a 30-point
opening, extension, gap repair and joker replacement followed by reuse. Each
uses the production reducer and complete-turn validator. Check move confirms
the exact objective; a legal but unrelated move does not complete it. Wrong
checks never end a turn or draw penalty tiles. Reset and Undo remain available.

Show clue explains the next action and previews the actual physical tile IDs.
The board follows the instructions in normal page flow, with a 300 px scrolling
table and reachable rack and Check controls. Completion retains the final table.
Restart remounts the board to clear stale selections. English and Simplified
Chinese goals use consistent group/run/joker terms and optional device reading.

`runset.exercises.v1` stores only this exercise session, validated with validSave,
the expected turn snapshot and objective checks. Regular saves and guided lesson
progress remain separate. Storage failures leave a readable notice and playable
session. Regular timed games retain their original deadline while practising.

Verification: three engine regressions cover conservation, all solutions,
insufficient openings, incomplete joker reuse and rebuilding after Reset. Four
browser flows complete every exercise at 360×640 and 1180×820 in both languages,
check restart/resume and verify regular-save isolation. A production offline flow
opens exercises and Chinese for the first time after disconnecting. Chromium
viewport checks do not establish physical iPhone/iPad Safari usability.
