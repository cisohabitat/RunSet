# Accessibility audit and corrections

This phase follows exact-commit CI success for the bot-audit correction
`01b24db`: [run 40423008180](https://github.com/cisohabitat/RunSet/actions/runs/40423008180).
The older stalled run is historical evidence, not the release gate used here.

## Verified barriers and fixes

- Quick exercises had no main landmark on its chooser/completion screens and
  instructions outside the main on its board. Teaching/exercise screens now own
  one main landmark; their embedded boards are named sections. Completed lessons
  also retain a main landmark. Regular games retain their own main.
- Invalid-move copy measured 3.89:1 on an invalid meld and 4.45:1 on the page.
  The light-theme warning colour is now `#9e3c2f`, passing 4.5:1 in the scanned
  states. Tile colours and dimensions are unchanged.
- Rules step labels measured 3.54:1 at 9 px. They now use the shared readable
  muted colour at 12 px. Dark-theme surfaces retain their own readable palette.
- Keyboard navigation into setup left focus behind. Screen changes now focus
  their heading after lazy content arrives; regular human play keeps useful rack
  focus. A keyboard-visible Skip to content link bypasses the repeated header.
  Native dialogs keep their focus, and locale/selection/clock updates do not
  rerun screen navigation or clear game state.
- A completed lesson move returned keyboard focus to the rack while changing the
  objective above it. Changed instructions, or their described Continue action
  at acknowledgement steps, receive focus and scroll into view after board focus
  work settles. Ordinary editing keeps its focus; changing
  language or voice does not restart a step or trigger narration.
- Quick-exercise starts, completion and returning to the chooser now move focus
  to their matching goal/success/title, without changing saved regular play.

## Coverage and limits

`@axe-core/playwright` is a development-only dependency. Four language/theme
cases scan ten states each: Home, setup, initial lesson, exercise chooser,
exercise board, regular game, Settings, rules, results and a completed lesson.
They check WCAG A/AA tags through 2.2 plus best-practice landmarks, with no blanket
rule exclusions. Runtime page errors are checked too.

Two cases exercise route/skip-link focus, roving tile navigation, keyboard
placement, Undo and the actual saved rack. Two cases complete the basics lesson
with genuine Tab traversal, arrows, Space, N and Enter, including drawing and
safe Reset. Two more cases use comfortable reading at 320 CSS pixels and verify
18 px instructions, no page-wide overflow, a hit-testable >=44 px Check control
and successful play. These are reflow checks, not certification of physical
Apple zoom or VoiceOver behavior.

The ten new browser flows bring the configured total to 185. Existing teaching,
reading, foundation, exercise and audio regressions remain release gates. The
production build is 97,903 bytes gzipped and retains the 100,000-byte initial-transfer budget and offline
availability of translated instructions, settings and audio.

Automated scans do not establish complete WCAG conformance. Physical iPhone/iPad,
VoiceOver, enlarged text on those devices, older-player comprehension and native
Mandarin listening remain paused in [the acceptance checklist](PREMIUM_ACCEPTANCE.md).

Local release checks: 112 unit tests passed; the 43-flow affected suite identified
and corrected a phone continuation/focus regression. The subsequent 16-flow
accessibility/tutorial and 14-flow final accessibility/exercise suites pass,
including the original strict phone continuation geometry.

All thirteen production offline flows pass after the final changes. The older
stalled Phase 1 run is now confirmed cancelled; its corrective run remains the
successful release gate.
