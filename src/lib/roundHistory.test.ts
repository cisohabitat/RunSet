import { beforeEach, expect, it, vi } from "vitest";
import { fixture } from "../engine/test-helpers";
import { reducer } from "../engine/game";
import {
  ROUND_HISTORY_KEY,
  completedRound,
  decodeRoundHistory,
  rememberRound,
  readRoundHistory,
  clearRoundHistory,
} from "./roundHistory";
import { observeTurns } from "./recentTurns";
let data: Map<string, string>;
const finish = () => {
  const start = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], true);
  start.players[start.current].name = "constructor";
  start.players[1 - start.current].name = "Pass";
  const draft = reducer(start, { type: "move", ids: [3], target: "run" });
  return { draft, end: reducer(draft, { type: "endTurn" }) };
};
beforeEach(async () => {
  data = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, v),
    removeItem: (k: string) => data.delete(k),
  });
  vi.stubGlobal("navigator", {});
  await clearRoundHistory();
});
it("projects literal names and engine round scores without retaining tiles or other save state", () => {
  const { end } = finish(),
    record = completedRound(end, 1234);
  expect(Object.keys(record).sort()).toEqual([
    "at",
    "id",
    "players",
    "round",
    "winner",
  ]);
  expect(record.players.find((p) => !p.bot)?.name).toBe("constructor");
  expect(record.players[record.winner].score).toBeGreaterThan(0);
  expect(record.players.reduce((n, p) => n + p.score, 0)).toBe(0);
  expect(
    record.players.every(
      (p) => Object.keys(p).sort().join() === "bot,name,score",
    ),
  ).toBe(true);
  expect(
    decodeRoundHistory(JSON.stringify({ version: 1, rounds: [record] })),
  ).toEqual([record]);
});
it("requires an observed real finish and ignores initial/reopened/replaced completed states", () => {
  const { draft, end } = finish();
  expect(observeTurns(end, 500)).toBeUndefined();
  expect(observeTurns(end, 500)).toBeNull();
  observeTurns(draft, 501);
  expect(observeTurns(end, 501)).toBeTruthy();
  expect(observeTurns(end, 501)).toBeNull();
  observeTurns(draft, 502);
  expect(observeTurns(end, 503)).toBeUndefined();
});
it("deduplicates finishes, bounds records and clears only the independent history key", async () => {
  const { end } = finish();
  data.set("runset.save.v1", "untouched game");
  data.set("runset.reading", "true");
  await rememberRound(end);
  await rememberRound(end);
  expect(readRoundHistory().rounds).toHaveLength(1);
  for (let i = 1; i <= 35; i++)
    await rememberRound({ ...end, seed: end.seed + i });
  expect(readRoundHistory().rounds).toHaveLength(30);
  expect(await clearRoundHistory()).toBe(true);
  expect(data).toEqual(
    new Map([
      ["runset.save.v1", "untouched game"],
      ["runset.reading", "true"],
    ]),
  );
});
it("preserves unreadable records and tolerates denied reads/writes without affecting the game", async () => {
  const { end } = finish();
  data.set(ROUND_HISTORY_KEY, "{damaged");
  expect(await rememberRound(end)).toBe(false);
  expect(data.get(ROUND_HISTORY_KEY)).toBe("{damaged");
  expect(readRoundHistory()).toEqual({ rounds: null, writeFailed: true });
  for (const patch of [
    { at: 1e20 },
    { winner: 4 },
    { players: [{ name: "x", bot: null, score: 42 }] },
  ]) {
    expect(
      decodeRoundHistory(
        JSON.stringify({
          version: 1,
          rounds: [{ ...completedRound(end), ...patch }],
        }),
      ),
    ).toBeNull();
  }
  const deniedWrite = vi.fn(() => { throw Error("quota"); });
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: deniedWrite });
  expect(await rememberRound(end)).toBe(false);
  expect(deniedWrite).toHaveBeenCalledOnce();
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw Error("denied");
    },
    setItem: () => {
      throw Error("denied");
    },
    removeItem: () => {
      throw Error("denied");
    },
  });
  expect(await rememberRound(end)).toBe(false);
  expect(await clearRoundHistory()).toBe(false);
});
it("does not resurrect a finish queued before Clear history under the optional lock", async () => {
  const queued: (() => void)[] = [];
  vi.stubGlobal("navigator", {
    locks: {
      request: (_key: string, action: () => boolean) =>
        new Promise<boolean>((resolve) => queued.push(() => resolve(action()))),
    },
  });
  const pending = rememberRound(finish().end),
    clear = clearRoundHistory();
  queued.shift()!();
  queued.shift()!();
  expect(await pending).toBe(true);
  expect(await clear).toBe(true);
  expect(readRoundHistory().rounds).toEqual([]);
});
