# Position confidence roadmap

Approved 2026-10-28. Complete and publish phases 1–3 separately, requiring each
exact-main-commit workflow (quality, every browser suite, aggregate check) to
pass before starting the next. Phase 4 remains paused. Multiplayer is deferred.

| Phase | Outcome | Status |
|---|---|---|
| 1 | Temporary practice copy of the current human turn | Published; complete main CI passed |
| 2 | Optional display organisation for public melds | Published; complete corrected main CI passed |
| 3 | Clear return-to-game context and next action | Implemented; acceptance requires the release gate below |
| 4 | Older Chinese-speaking player study on physical Apple devices | Paused |

## Phase 1: practise this position

Help with this turn offers a temporary, lazy-loaded modal. It copies the human
rack, public table and original opening/joker context, including unfinished edits.
It never copies hidden allocations, clocks, match scores, logs or Undo history.
Unseen physical IDs are kept in an unrendered inert holder solely to preserve
engine conservation. No opponent/pool counts or draws are presented as real.

Moves, sorting, Undo and Reset use the pure reducer on separate local state.
Check validates the whole turn and accepts it through the reducer without copying
anything back. Invalid checks apply no penalty. Reset uses the original turn
snapshot; Restart uses the captured draft. Closing/reloading discards practice.
No practice storage key, profile mutation, automatic hints, bot or speech is added.

The regular game stays mounted with its selection/view intact. Its actual timer
continues; any real state replacement closes the old copy. Modal focus returns
to the explicit opener; an expired/unmounted opener is never refocused. The
practice board has distinct table/rack IDs and no second main-content landmark.

Phase 1 local evidence: 182 unit tests; ten final practice journeys (2 Chromium,
6 compatibility, 2 offline) and six unchanged comfortable table-space checks
passed. Reviewed English light/Chinese dark phone and tablet views. Standard
phone practice fits two meld columns without smaller tiles; comfortable captions
and controls stay readable. The completed-table scroll region is keyboard
focusable. Initial gzip 99,252 bytes under the unchanged 100,000-byte budget;
67 precached files. Complete main CI is checked after publication.

Phase 1 accepted main: 0192c6a, complete CI
[40650578708](https://github.com/cisohabitat/RunSet/actions/runs/40650578708).
Six matching live bilingual practice journeys passed on READY production.

## Phase 2: optional table arrangement

More → Find and arrange tiles contains a native Table arrangement disclosure.
Placed order is the default. Groups then runs and Colour then number project
the public table without changing engine array order, meld IDs, physical tile
order, selections, hints, Undo or deadlines. Invalid/empty drafts stay first in
organised views; runs use their common colour and matching groups follow them
in colour mode. Stable source numbers remain visible in the existing destination
caption, and help/finder labels retain those original meanings. No permanent row
or smaller tile is added. Practice ignores this regular-game preference.

The bounded runset.tableOrder.v1 choice is stored only on explicit changes,
preserved on deletion and included in validated portable profiles with meaningful
translated labels. Denied writes leave the current display usable with a notice.
Tests cover actual numbered placement after sorting, Undo, hidden-rack selection,
exact saves/deadlines, all display modes, malformed preference input, profile
round trips, write failure, offline reload, deletion and real expiry.

Phase 2 local gate: 186 unit tests, then focused translation/profile/projection
checks after caption polish, and ten final browser journeys passed (2 Chromium,
6 compatibility, 2 offline). Native selector hit targets are checked in the real
scrolled More panel. Reviewed bilingual phone/tablet screenshots, including
inline original meld numbers. Initial gzip 99,257 bytes; 67 precached files.
Full exact-main CI is inspected after publication before Phase 3 starts.

A final Phase 2 malformed-preference regression exposed inherited object keys
returning non-text values in the new profile choice summary. The correction
accepts only string labels, so constructor/__proto__ display Unavailable. The
regression was observed failing, then all 19 focused projection/profile/i18n
checks and build passed. The organised Game UI/runtime is unchanged by this
correction. Final initial gzip is 99,260 bytes; the new exact-main CI gate must
finish before Phase 3. The first publication was b418044; it is not the accepted
gate if superseded by this correction.

Phase 2 accepted main: 8eecb70, complete CI
[40654155816](https://github.com/cisohabitat/RunSet/actions/runs/40654155816).
All six matching live bilingual arrangement journeys passed on READY production
before Phase 3 started.

## Phase 3: return-to-game guidance

Both home views share a lazy, read-only Next when you continue summary. Existing
turnGuidance supplies actual invalid-meld, opening-points, ready-play, pool-empty
and opponent-turn explanations. Unfinished human edits remain explicit. Timed
copy explains that the original deadline applies and continuing processes an
expired turn; no new timer, storage operation, auto-play or planner is added.
Continue stays available independently of loading the optional summary. Guidance
uses 16 px text, 18 px in comfortable reading, with long-text wrapping.

Bilingual browser journeys check both home views, a real repair of the saved
draft, exact bytes/history/deadline across Home and reload, first-use offline
loading, literal names, native action hit targets, accessibility and actual expiry
when continuing. The connected release journey now also organises the real table,
practises the repair in a temporary copy, verifies its original draft survives,
finishes the actual round, reviews it and recovers it through backup deletion and
import. The table-order preference is checked through recovery too.

Release evidence and final acceptance are tracked in POSITION_CONFIDENCE_RELEASE.md.
Physical Apple-device, older-player, native Mandarin listening and battery
acceptance remain unverified; the physical study remains paused.

Phase 3 release gate: publish this implementation to main, wait for the complete
exact-commit CI workflow (quality, Chromium, WebKit phone/iPad, Firefox, offline
and aggregate check), then verify matching READY production and live bilingual
journeys. See the [main CI history](https://github.com/cisohabitat/RunSet/actions/workflows/ci.yml?query=branch%3Amain)
for the authoritative result of the commit containing this document.

Final Phase 3 local gate: type/build, 186 unit tests and 48 targeted browser
journeys passed (10 Chromium, 30 compatibility, 8 offline), plus six repeated
WebKit-phone guidance cases after fixing the reproduced placement tap loss.
The initial bundle is 99,249 gzip bytes with 70 precached files. Phone/tablet
English-light and Chinese-dark guidance screenshots were reviewed. Full main
CI remains the authoritative post-publication gate, not the targeted local count.
