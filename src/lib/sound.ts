export type Cue =
  "select" | "place" | "draw" | "invalid" | "turn" | "win" | "lose";
let context: AudioContext | undefined;
export function sound(cue: Cue, muted: boolean) {
  if (muted) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const notes: Record<Cue, number[]> = {
      select: [520],
      place: [440, 660],
      draw: [300, 240],
      invalid: [190, 150],
      turn: [440, 550, 660],
      win: [523, 659, 784, 1047],
      lose: [392, 330, 262],
    };
    notes[cue].forEach((freq, i) => {
      const osc = context!.createOscillator(),
        gain = context!.createGain(),
        t = context!.currentTime + i * 0.09;
      osc.connect(gain);
      gain.connect(context!.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  } catch {
    /* Sound is optional. */
  }
}
