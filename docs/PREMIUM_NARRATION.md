# Optional recorded guidance

Seventeen exact lesson/exercise captions have both English and Mandarin MP3s
(34 files, 2,373,264 bytes). Generic synthetic voices: en-US-JennyNeural and
zh-CN-XiaoxiaoNeural, rate −5%, pitch +3 Hz, generated with edge-tts 7.3.1.
Clips decode to approximately 5–19 seconds. These settings aim for a light,
unhurried delivery; native-speaker pronunciation and cheerful prosody review
have **not** run and remain part of the paused human acceptance phase.

Listen is explicit. Replay, Stop, switching voice/language, leaving the screen,
closing a containing menu and hiding the page cancel the owned playback. No
recording autoplays. Reading voice offers Recorded guide or Device voice;
`runset.audioVoice` is separate from game saves and sound-effect preferences.
A failed recording leaves text and the device choice available. Device voice
still requires a suitable installed voice for offline use.

Caption text and locale must exactly match `src/lib/narration.json`; changed or
dynamic text falls back to the existing device reader. All original captions
remain visible. Static MP3s are included in the generated service-worker cache;
Ready offline is the readiness gate. No runtime speech service, API key or new
runtime dependency is required. Narration code/captions load with the game or
lesson. Initial HTML/CSS/JS remains 97,572 bytes gzipped, under 100,000.

Authoring: `node scripts/prepare-narration.mjs`, then use a temporary Python
virtual environment with `edge-tts==7.3.1` and run
`python scripts/generate-narration.py`. Existing clips are retained; remove only
the clips deliberately being regenerated after reviewing the caption diff.
The optional generator uses the configured HTTPS proxy and trusted CA bundle;
it is not invoked by CI, build or the app. Review audio before accepting changes.

Verification includes exact-caption asset checks, decoded duration checks,
real Chromium playback without Web Speech, Stop/Replay, voice/locale/screen
cleanup and readable failed-playback fallback. The production offline test
plays Mandarin on first exercise visit after disconnecting. These tests prove
asset availability and playback behavior, not pronunciation or physical Apple
browser/audio behavior.
