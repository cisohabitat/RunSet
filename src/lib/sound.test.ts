import { expect, it, vi } from "vitest";
import { reducer } from "../engine/game";
import { fixture } from "../engine/test-helpers";
import { primeAudio, sound, stopSounds, transitionCue } from "./sound";

it("sounds actual placement and undo, without replaying unchanged states or preferences", () => {
  const before = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], true);
  const placed = reducer(before, { type: "move", ids: [3], target: "run" });
  expect(transitionCue(before, placed)).toBe("place");
  expect(transitionCue(placed, reducer(placed, { type: "undo" }))).toBe(
    "select",
  );
  expect(transitionCue(before, before)).toBeNull();
  expect(transitionCue(before, { ...before, coach: !before.coach })).toBeNull();
  expect(
    transitionCue(before, { ...before, seed: before.seed + 1 }),
  ).toBeNull();
});
it("does not report success for a rejected opening extension", () => {
  const before = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], false);
  const rejected = reducer(before, { type: "move", ids: [3], target: "run" });
  expect(rejected.table).toEqual(before.table);
  expect(transitionCue(before, rejected)).toBe("invalid");
});
it("distinguishes a real draw from an empty-pool pass", () => {
  const before = fixture([3]);
  expect(transitionCue(before, reducer(before, { type: "draw" }))).toBe("draw");
  before.players[1 - before.current].rack.push(...before.pool.splice(0));
  expect(transitionCue(before, reducer(before, { type: "draw" }))).toBe("turn");
});
it("announces the human turn after a bot finishes, rather than every copied state", () => {
  const start = fixture([3]),
    bot = reducer(start, { type: "draw" });
  expect(bot.players[bot.current].bot).toBeTruthy();
  expect(transitionCue(bot, reducer(bot, { type: "draw" }))).toBe("turn");
  expect(transitionCue(bot, structuredClone(bot))).toBeNull();
});
it("celebrates the actual winner once and ignores reopening a completed result", () => {
  const start = fixture([9, 35, 61]);
  const placed = reducer(start, {
    type: "move",
    ids: [9, 35, 61],
    target: "new",
  });
  const finished = reducer(placed, { type: "endTurn" });
  expect(finished.phase).toBe("over");
  expect(transitionCue(placed, finished)).toBe("win");
  expect(transitionCue(finished, structuredClone(finished))).toBeNull();
  const botPlaced = structuredClone(placed),
    botFinished = structuredClone(finished);
  botPlaced.players[botPlaced.current].bot = "easy";
  botFinished.players[botPlaced.current].bot = "easy";
  expect(transitionCue(botPlaced, botFinished)).toBe("lose");
});

it("cancels scheduled cues, releases finished notes and never replays on resume", () => {
  const nodes: {stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; onended: (() => void) | null}[] = [];
  const doc = {hidden: false};
  let state = "running";
  vi.stubGlobal("document", doc);
  vi.stubGlobal("AudioContext", class {
    get state() { return state; }
    currentTime = 1;
    destination = {};
    resume() { state = "running"; return Promise.resolve(); }
    createOscillator() {
      const node = {connect() {}, disconnect: vi.fn(), frequency: {value: 0}, type: "sine", start: vi.fn(), stop: vi.fn(), onended: null as (() => void) | null};
      nodes.push(node);
      return node;
    }
    createGain() { return {connect() {}, disconnect() {}, gain: {setValueAtTime() {}, exponentialRampToValueAtTime() {}}}; }
  });
  try {
    primeAudio();
    sound("win", false);
    expect(nodes).toHaveLength(4);
    stopSounds();
    for (const node of nodes) expect(node.stop).toHaveBeenLastCalledWith();
    const calls = nodes.map(node => node.stop.mock.calls.length);
    stopSounds();
    expect(nodes.map(node => node.stop.mock.calls.length)).toEqual(calls);
    sound("select", false);
    const finished = nodes[4];
    finished.onended!();
    stopSounds();
    expect(finished.disconnect).toHaveBeenCalledOnce();
    expect(finished.stop).toHaveBeenCalledOnce(); // Only its scheduled natural end.
    doc.hidden = true;
    sound("win", false);
    doc.hidden = false;
    sound("win", true);
    state = "suspended";
    sound("win", false);
    expect(nodes).toHaveLength(5);
    primeAudio();
    expect(nodes).toHaveLength(5);
    sound("select", false);
    expect(nodes).toHaveLength(6);
  } finally {
    stopSounds();
    vi.unstubAllGlobals();
  }
});
