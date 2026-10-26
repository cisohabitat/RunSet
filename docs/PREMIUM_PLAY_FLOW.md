# Premium phase 2: a shorter path into play

Home gives a saved game's Continue (or View results) action the primary position.
A new visitor still gets Learn to play first. Learning remains available for
returning players and never replaces their regular save.

New-game setup defaults to one Easy opponent, one round, no timer and guidance
on. The name, current-option summary and Deal button are visible immediately;
More game options contains difficulty, opponent count, match length, timer and
guidance. Editing replay settings opens those options automatically and retains
the saved choices. Use gentle defaults resets options while keeping the name.
An empty name uses the current language's You/你 fallback.

One native **View** selector replaces the separate Expand/Compact/Hide/Show
controls:

| Choice      | Result                                         |
| ----------- | ---------------------------------------------- |
| Standard    | Normal page and game information               |
| Full screen | Viewport table, visible rack and turn controls |
| Table only  | Full screen with the rack temporarily hidden   |

Full-screen preference is remembered. Hidden rack state resets on the next
turn, reload or exit to Standard. Practice never hides its rack or inherits the
regular game's view preference. Escape returns to Standard and focuses the
selector; an open native confirmation keeps its own Escape behavior. View
changes preserve selections, saves, timers and tile sizes.

On standard short phones with coaching enabled, the compact next instruction
gets priority over match/timer prose. The countdown stays in the table toolbar;
actual match scores and round number remain in More → Match scores. The guide
has a labelled 44 px dismiss control. Larger screens and Comfortable reading
retain full instructions. This avoids a clipped coaching sliver when a match,
timer, selection and rack are all present, while keeping the 180 px table floor.

Verification covers both languages and phone/tablet/desktop viewports, the first
screen's Deal hit target, safe whitespace-name fallback, saved-game priority,
custom setup, replay, selected tiles, expanded views, hidden racks, keyboard
focus and offline first use. Physical Apple device checks remain paused.

The final focused browser suite passes 70 flows, including the combined short
phone case and large-reading landscape. All 96 unit tests and ten production
offline flows pass. Typecheck/build pass; initial HTML/CSS/JS total 96,780 bytes
gzipped against the 100,000-byte budget. Screenshots were inspected in
light/dark themes and both languages. The full browser suite now contains 137
flows and runs in GitHub CI before the next phase starts.
