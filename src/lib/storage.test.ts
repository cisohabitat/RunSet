import { beforeEach, it, expect, vi } from "vitest";
import { newGame, reducer } from "../engine/game";
import { deleteGame, saveGame, loadGame, SAVE_KEY } from "./storage";
let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
  loadGame();
});
it("round-trips a half-finished turn exactly", async () => {
  const s = newGame("You", 2, "normal", 42);
  s.current = s.players.findIndex((p) => !p.bot);
  s.turnStart = { table: [], rack: [...s.players[s.current].rack] };
  const moved = reducer(s, {
    type: "move",
    ids: s.players[s.current].rack.slice(0, 2),
    target: "new",
  });
  expect(await saveGame(moved)).toBe(true);
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
it("rejects missing tiles and allows games when storage is unavailable", async () => {
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
  expect(await saveGame(s)).toBe(false);
  expect(loadGame().game).toBeNull();
});

it("rejects a damaged turn snapshot", () => {
  const s = newGame("You", 1, "easy", 2);
  s.turnStart.table = [{ id: "broken", tiles: [-1, 1, 2] }];
  data.set(SAVE_KEY, JSON.stringify(s));
  expect(loadGame().game).toBeNull();
  expect(loadGame().game).toBeNull();
});

it("deletes only the game and preserves preferences", async () => {
  const { deleteGame } = await import("./storage");
  await saveGame(newGame("You", 1, "easy"));
  data.set("runset.muted", "true");
  data.set("runset.practice.v1", "practice");
  expect(await deleteGame()).toBe(true);
  expect(loadGame().game).toBeNull();
  expect(data.get("runset.muted")).toBe("true");
  expect(data.get("runset.practice.v1")).toBe("practice");
});
it("reports deletion failure without claiming success", async () => {
  const { deleteGame } = await import("./storage");
  vi.stubGlobal("localStorage", {
    removeItem: () => {
      throw Error("denied");
    },
  });
  expect(await deleteGame()).toBe(false);
});

it("rejects stale writes and deletes without restoring a deleted game", async () => {
  const s = newGame("You", 1, "easy", 3);
  expect(await saveGame(s)).toBe(true);
  data.delete(SAVE_KEY);
  expect(await saveGame(s)).toBe(false);
  expect(data.has(SAVE_KEY)).toBe(false);
  loadGame();
  const remote = newGame("Other", 1, "easy", 4);
  data.set(SAVE_KEY, JSON.stringify(remote));
  expect(await deleteGame()).toBe(false);
  expect(JSON.parse(data.get(SAVE_KEY)!)).toEqual(remote);
});
it("serializes local saves and invalidates queued writes after deletion", async () => {
  const a = newGame("You", 1, "easy", 3),
    b = reducer(a, { type: "sortRack", by: "number" });
  const first = saveGame(a),
    second = saveGame(b);
  expect(await first).toBe(true);
  expect(await second).toBe(true);
  const deletion = deleteGame(),
    stale = saveGame(b);
  expect(await deletion).toBe(true);
  expect(await stale).toBe(false);
  expect(data.has(SAVE_KEY)).toBe(false);
});
