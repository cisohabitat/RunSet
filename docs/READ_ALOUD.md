# Optional lesson and reminder audio

Phase 5 adds user-requested speech in Mandarin and English without changing the
rules, saves, timers, practice progress or game sound setting.

## Player flow

In practice, Listen reads the current heading and instruction. Replay starts
that instruction again; Stop cancels and returns focus to the playback button.
Instructions and progress remain visible. Regular play offers Listen to reminder
inside More, including expanded-table view. Its transcript describes the current
next action and End-turn condition. Closing More stops its speech.

The More popup is anchored to the turn toolbar so changing selection does not
push it beyond either phone edge. Lesson continuation scrolls into view before
paint, with a 12 px margin to avoid fractional-pixel clipping at the screen edge.

Each utterance requires a tap or keyboard activation. Advancing/changing a lesson,
changing the instruction/reminder or language, exiting practice/game, hiding the
tab or leaving the page cancels current speech. No next instruction is queued.
Late events from a canceled utterance cannot stop a newer replay.

## Voice behavior and limits

The browser Web Speech API supplies the voice; no narration files, third-party
speech SDK, backend or credentials are added. The selected UI language determines
the voice. Mainland Mandarin is preferred among equally local Chinese voices;
other explicitly Mandarin language tags and Mandarin Taiwan/Singapore voices are
accepted. Cantonese/Hong Kong and unrelated defaults are not substituted.
Installed matching voices are preferred, with a slightly slower reading rate.

Offline audio depends on an installed matching voice. Network-only voices are
excluded when the browser reports offline. The application remains playable and
readable if speech is unsupported, the voice list is empty/late, a matching voice
is absent, or synthesis fails. The message allows retry after loading/installing
a suitable voice. An operating system/browser may still fail to play a reported
voice; this is handled as an audio error, not successful completion of a lesson.

Game sound effects are separate. Requesting Listen explicitly enables that one
reading even if sound cues are off. No always-on audio preference is stored.

## Verification

- Strict TypeScript, 92 unit tests, production build and initial bundle budget.
- 82 browser flows, including six new audio flows. Phone/tablet/desktop cover
  Chinese requests, repeat/stop, language and instruction changes, stale speech
  events, error/fallback, and regular reminders with save preservation. Existing
  complete lessons, comfortable reading and expanded-table checks remain intact.
- Ten production offline flows, including first-use Chinese lessons after
  disconnecting with installed versus network-only mock voices.
- Light/dark screenshots and playback/menu hit targets are inspected.

Speech adapters are mocked in automated audio flows: these checks verify which
text/voice is requested and how controls and failures behave. They do **not**
verify audible sound, pronunciation, actual installed-voice downloads or Apple
Safari speech behavior. Physical iPhone/iPad and older-player listening checks
remain outstanding; Phase 1 is still paused. Phase 6 remains planned.
