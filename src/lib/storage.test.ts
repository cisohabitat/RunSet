import { beforeEach, it, expect, vi } from "vitest";
import { newGame, reducer } from "../engine/game";
import { saveGame, loadGame, SAVE_KEY } from "./storage";
let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
});
it("round-trips a half-finished turn exactly", () => {
  const s = newGame("You", 2, "normal", 42);
  s.current = s.players.findIndex((p) => !p.bot);
  s.turnStart = { table: [], rack: [...s.players[s.current].rack] };
  const moved = reducer(s, {
    type: "move",
    ids: s.players[s.current].rack.slice(0, 2),
    target: "new",
  });
  expect(saveGame(moved)).toBe(true);
  expect(loadGame().game).toEqual(moved);
});
it("discards malformed and unsupported saves with a notice", () => {
  for (const value of [
    "{",
    "{}",
    JSON.stringify({ ...newGame("You", 1, "easy", 2), version: 0 }),
  ]) {
    data.set(SAVE_KEY, value);
    expect(loadGame().game).toBeNull();
    expect(data.has(SAVE_KEY)).toBe(false);
  }
});
it("rejects missing tiles and allows games when storage is unavailable", () => {
  const s = newGame("You", 1, "easy", 2);
  s.pool.pop();
  data.set(SAVE_KEY, JSON.stringify(s));
  expect(loadGame().notice).not.toBe("");
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw Error("denied");
    },
    setItem: () => {
      throw Error("full");
    },
    removeItem: () => {
      throw Error("denied");
    },
  });
  expect(saveGame(s)).toBe(false);
  expect(loadGame().game).toBeNull();
});

it("rejects a damaged turn snapshot", () => {
  const s = newGame("You", 1, "easy", 2);
  s.turnStart.table = [{ id: "broken", tiles: [-1, 1, 2] }];
  data.set(SAVE_KEY, JSON.stringify(s));
  expect(loadGame().game).toBeNull();
  expect(loadGame().game).toBeNull();
});
