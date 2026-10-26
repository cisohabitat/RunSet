# English and Simplified Chinese

RunSet includes English and Simplified Chinese (`zh-CN`). Choose a language from
**语言 / Language** in the header, including during a game or lesson. On first
visit, Chinese browser locales default to Chinese; otherwise English is used.
An explicit choice overrides browser language and is stored as `runset.language`.
Deleting a game retains that preference.

Chinese covers setup, rules, all three guided lessons, tile labels for screen
readers, hints and their explanations, timer/penalty messages, bot move narration,
results, save/recovery/import errors, installation and offline/update guidance.
Player names and the RunSet brand remain literal. New Chinese games and newly
started Chinese practice use 你 as the default human name. Existing saved names
are preserved.

## Wording for first-time players

| English | Simplified Chinese | Explanation used in lessons |
| --- | --- | --- |
| Group | 同数组 | 3 or 4 matching numbers, each in a different colour |
| Run | 顺子 | At least 3 consecutive numbers in one colour |
| Joker | 万能牌 | Replaces a missing tile |
| Opening | 开局 / 第一次出牌 | At least 30 points from the player's own rack |
| Rack | 手牌 / 手牌区 | Tiles the player holds |
| Pool | 待摸的牌 / 牌堆 | Shared face-down tiles |
| Draw | 摸一张牌 | Resets unfinished edits and ends the turn |
| Pass | 跳过 | Used when no tiles remain to draw |
| Reset | 重置 | Restores this turn's edits without a penalty |

Copy uses direct actions and concrete examples instead of translating English
marketing idioms literally. Chinese rules and lesson instructions have larger
text; lesson navigation and main actions have touch targets of at least 44 px.
Chinese practice uses a scrolling page so larger instructions do not squeeze or
cover table tiles. Regular games retain the bounded table and player dock.
Fonts come from the device; no font download or translation service is needed.

## Implementation and verification

`I18nProvider` owns presentation language without remounting the app. UI text uses
`useI18n().t`; rules and stored game/log data remain unchanged. Translation uses
exact phrases and anchored message patterns in `src/i18n/zh-CN.ts`. Parameters
named `name*` stay literal; numeric parameters are constrained. Nested rule and
hint explanations are translated on display, including existing English saves.
Unknown messages fall back to readable English. New or changed messages require
matching dictionary entries and tests.

The dictionary is a separate approximately 13.6 kB gzip chunk. Illustrated rules
are also loaded separately, preserving the existing 100,000-byte initial-download
budget. The production service worker precaches both alongside lessons and bots.
A failed language download leaves English available and reports a bilingual
error; first-load Chinese failure offers retry and English.

Automated evidence:

- Five translation tests cover static UI labels, template parameters, nested
  hints, both pool states, planner fallbacks, rule feedback and literal names.
- Six browser flows cover Chinese lessons on 375×667, 820×1180 (dark), and
  1180×757; switching with selected tiles; reload/resume; Chinese browser defaults;
  saved English preference; game/save/name preservation; import error and deletion;
  and empty-pool hints, timer, menu and results at 360×640.
- Lesson controls are hit-tested before clicking, including after scrolling.
  Browser page errors are checked and screenshots inspected in light/dark themes.
- A production offline test disconnects before the first Chinese visit, then
  switches language, reloads, opens lessons and rules, and switches back.
- Existing English gameplay, visual, lesson and offline regressions still pass.

The full checks are recorded in VERIFICATION.md. These are Chromium viewport
checks; physical iPhone/iPad Safari and comprehension testing with older native
Chinese speakers have not been performed. Such a playtest remains useful for
confirming comfortable text size and preferred local terminology.

Comfortable reading is available in both languages from Settings (设置). Its
copy, controls and timed-game reminder are translated. Eight additional browser
flows and a fifth offline flow cover the shared reading mode; see READING_MODE.md.
