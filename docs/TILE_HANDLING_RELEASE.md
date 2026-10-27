# Tile handling release evidence

The five-phase cycle covers optional rack ordering, board finding, move help,
complete-turn practice and combined release verification. It preserves the pure
106-tile engine, standard defaults, independent learning/view preferences,
English/Simplified Chinese, offline play and the existing compact board sizes.
Multiplayer remains deferred. Physical Apple devices, older-player sessions and
native Mandarin voice acceptance remain paused and are not claimed here.

## Published phase gates

Each next implementation began only after the predecessor's complete exact-SHA
workflow succeeded, including all browser matrix jobs and the aggregate check.

| Phase | Accepted commit | Complete CI | Live acceptance |
| --- | --- | --- | --- |
| Rack organisation | `8de6b4a` | [40508473691](https://github.com/cisohabitat/RunSet/actions/runs/40508473691) | Six feedback cases on the matching ready release; six rack-order cases on the preceding same-feature release. |
| Board navigation | `df0bc55` | [40515948000](https://github.com/cisohabitat/RunSet/actions/runs/40515948000) | Six bilingual WebKit/Firefox finder journeys. |
| Helpful explanations | `7859bec` | [40523691882](https://github.com/cisohabitat/RunSet/actions/runs/40523691882) | Six bilingual WebKit/Firefox move-help journeys, including first-use offline, Reset and timed expiry. |
| Whole-turn practice | `6effa7a` | [40527834642](https://github.com/cisohabitat/RunSet/actions/runs/40527834642) | Six bilingual WebKit/Firefox guided/quiet practice journeys. |

Phase 5's final exact-commit workflow is checked after publishing; the current
[main workflow history](https://github.com/cisohabitat/RunSet/actions?query=branch%3Amain)
records its result. A ready Vercel deployment or one successful matrix job is
never used as the complete CI gate.

## Combined release journeys

`e2e/helpers/handling-release.ts` exercises one connected player journey through:

- Manual rack order, a real incomplete placement, read-only affected-tile help,
  adding the suggested physical tile and finding the accepted placement.
- Hiding the rack and finding its selected tile, leaving Full screen through View,
  portrait/landscape rotation and selection/save preservation.
- Comfortable reading and higher contrast, exact 58×80 comfortable tiles, return
  to the original compact dimensions, and language changes without a new deal.
- Expanded visible board floors of 300 px on phones and 450 px on larger views,
  hit-tested controls, Axe scans, horizontal bounds and screenshot inspection.
- Saving before Home, guided practice completion, a quiet practice draft, and
  regular-game bytes preserved through the learning journey.
- Downloading and validating a backup, cancelling deletion, deleting regular and
  automatic recovery saves, retaining view/learning/order preferences, importing
  the backup, restoring the ordered rack and reloading the seven-meld draft.

The production journeys prepare offline assets on Home, disconnect before the
first use of the optional tools/Chinese dictionary and stay disconnected through
practice, deletion, import and reload. WebKit phone/iPad and Firefox each run both
languages. Two Chromium phone cases cover genuine touch input. Two desktop cases
activate buttons/tiles with the keyboard; their normal development server does
not claim service-worker offline support. Production suites cover that separately.

The first draft of the journey incorrectly expected the hidden header in Full
screen and tried offline readiness on the development server. Corrected tests use
the real visible View navigation and production-only service worker. No product
controls, geometry assertions or CI coverage were relaxed.

The Chinese move-help entry now says 出牌帮助: the panel can explain an unfinished
accepted draft as well as a blocked move. It no longer labels every explanation
as a failed move. Existing English text and engine messages stay unchanged.

## Release gates and limits

The final build typechecks and passes the unchanged initial-download limit:
99,523 gzip bytes under 100,000; 58 files are precached. Whole-turn CSS and the
Chinese dictionary remain optional initial-download assets and are cached for
offline use. Existing strict geometry, timer expiry, touch cancellation, real
mouse dragging, Undo, accessibility, media and recovery suites remain enabled.

The complete final gate comprises 143 unit tests, 282 Chromium cases, 201
compatibility cases, 25 offline cases and benchmark smoke. All three browser
matrix jobs retain complete dependency/audio installation, signed HTTPS mirrors,
twenty-minute job limits, five-minute offline limit and distinct failure artifacts.
The aggregate `check` must succeed before final acceptance.

These are automated desktop-browser and emulated viewport results. Linux WebKit
is not physical iOS validation. Audio tests do not establish Mandarin tone,
pronunciation or older-player comprehension. New practice captions use explicit
Listen with device-speech fallback until matching reviewed recordings exist.
