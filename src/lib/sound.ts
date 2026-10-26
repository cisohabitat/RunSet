import { results, type GameState } from "../engine/game";
export type Cue =
  | "select"
  | "place"
  | "draw"
  | "invalid"
  | "turn"
  | "win"
  | "lose";
let context: AudioContext | undefined;
/** Unlock from a real pointer/key gesture, without playing a note. */
export function primeAudio() {
  try {
    if (!context || context.state === "closed") context = new AudioContext();
    if (context.state !== "running") void context.resume().catch(() => {});
  } catch {
    /* Audio is optional. */
  }
}
export function transitionCue(
  before: GameState | null,
  after: GameState | null,
): Cue | null {
  if (
    !before ||
    !after ||
    before === after ||
    before.seed !== after.seed ||
    after.turn < before.turn
  )
    return null;
  if (before.phase !== "over" && after.phase === "over")
    return results(after).find((player) => player.winner)?.bot ? "lose" : "win";
  if (after.turn !== before.turn) {
    if (!before.players[before.current].bot)
      return after.pool.length < before.pool.length ? "draw" : "turn";
    return after.players[after.current].bot ? null : "turn";
  }
  if (JSON.stringify(before.table) !== JSON.stringify(after.table)) {
    const oldRack =
      before.players.find((player) => !player.bot)?.rack.length ?? 0;
    const newRack =
      after.players.find((player) => !player.bot)?.rack.length ?? 0;
    return newRack > oldRack ? "select" : "place";
  }
  return after.notice && after.notice !== before.notice ? "invalid" : null;
}
export function sound(cue: Cue, muted: boolean) {
  if (muted || !context || context.state !== "running" || document.hidden)
    return;
  try {
    const notes: Record<Cue, number[]> = {
      select: [520],
      place: [440, 660],
      draw: [300, 240],
      invalid: [190, 150],
      turn: [440, 550, 660],
      win: [523, 659, 784, 1047],
      lose: [392, 330, 262],
    };
    const duration = cue === "select" ? 0.06 : cue === "place" ? 0.12 : 0.18;
    const volume = cue === "select" ? 0.015 : cue === "win" ? 0.04 : 0.028;
    notes[cue].forEach((freq, i) => {
      const osc = context!.createOscillator(),
        gain = context!.createGain(),
        t = context!.currentTime + i * 0.09;
      osc.connect(gain);
      gain.connect(context!.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    });
  } catch {
    /* Sound is optional. */
  }
}
