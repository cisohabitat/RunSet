# Crowded-board review

Phase 3 follows a player from a crowded rack through locating a numbered public
destination, placing a tile, finding it again, Undo and reload. This static game
has no API: native controls and focus navigation feed the shared reducer, then
the persisted save and rendered board are checked together.

## Demonstrated clarity gap

Placement feedback and Table overview identify groups by number, but the default
placed arrangement did not display those numbers on the board. The same labels
already appeared in organised views. The new English phone regression failed
before the fix: zero numbered captions instead of 15.

Regular games now retain the inline number in every arrangement. The existing
caption, native targets and tile sizes are reused; there is no new toolbar or
card row. Accessible placement names already contain the number, so its visual
prefix remains aria-hidden. Practice captions retain their existing behavior.
The game rules, table ordering and physical tile locations are unchanged.

## Crowded journey

The fixture has 50 public tiles in 15 valid melds, 50 rack tiles, six opponent
tiles and a full 100-snapshot Undo history. English uses light theme and a running
120-second clock; Chinese uses dark theme and comfortable reading. Offline
compatibility cases disconnect and reload before entering the game.

The journey checks:

- All 15 default captions agree with source numbering and the overview.
- Home/End and wrapping Left/Right arrows reach both ends of the actual rack;
  the entire focused tile stays inside its scroll region and viewport, with a
  clear centre hit and native target size.
- Read-only navigation preserves the exact save bytes. Table-only retains the
  existing 300 px phone / 450 px larger-screen board floor.
- Finding selected tile 89 reveals the hidden rack without changing selection.
  The overview then finds group 15 without placing the selected tile.
- Actual placement into group 15 matches the authoritative reducer and legal
  turn validator, conserves all 106 IDs and retains the original deadline and
  100-snapshot cap. Latest placement finds the real moved tile.
- The prior accepted-play dot and accessible description remain distinct from
  the unfinished edit. Undo restores the rack/table and makes the finder locate
  that surviving accepted-play marker rather than the undone edit.
- Offline reload preserves the exact undone save. Accessibility, runtime errors
  and horizontal overflow are checked. English logical expiry restores the
  turn-start layout, clears Undo and advances exactly once with an empty pool.

Screenshots cover the actual placement on phone and landscape iPad in both
languages. Existing meld-space cases retain long-run, invalid-draft, native text
metrics and target-containment checks; arrangement cases retain sorting, source
numbers, hidden racks, selection, Undo and timer checks.

## Verification and limits

All 222 units passed. Production build/typecheck passed at 98,812 initial gzip
bytes, within the unchanged 100,000 cap, with 77 cached files. All 24 focused
local browser cases passed: six Chromium and 18 offline compatibility cases,
covering the new journey plus existing meld-space and arrangement controls.
Phone and landscape-iPad screenshots were inspected in both languages/themes.
Exact-commit CI must pass before the next phase. Required CI
keeps all six browser projects, 20-minute jobs and five-minute offline shards.

These are synthetic crowded states and browser emulation. They do not establish
physical iPhone/iPad performance, mobile suspension behavior, older-player ease
of use or native Mandarin comprehension. Those studies remain paused. No
production check is claimed until the user's manual Vercel deployment matches
the published commit.
