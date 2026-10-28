import { beforeEach, expect, it, vi } from "vitest";
import { practiceGame } from "../engine/practice";
import { exerciseGame } from "../engine/exercises";
import { exportProfile, importProfile, validProfileValue } from "./profile";
import { freshTurnPractice } from "./turnPractice";
import { loadGame, persistGame, SAVE_KEY, BACKUP_KEY } from "./storage";
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
it("round trips game, all learning formats and display choices without normalising saved bytes", () => {
  data.set(
    "runset.turnPractice.v1",
    JSON.stringify(freshTurnPractice("quiet", "你", "joker", 3).record),
  );
  data.set(
    "runset.practice.v1",
    JSON.stringify({ lesson: "basics", step: 0, game: practiceGame() }),
  );
  data.set(
    "runset.exercises.v1",
    JSON.stringify({
      version: 1,
      kind: "opening",
      checked: false,
      game: exerciseGame("opening"),
    }),
  );
  data.set(
    "runset.solo.v1",
    JSON.stringify({
      version: 1,
      completed: ["opening:4321"],
      kinds: ["opening"],
    }),
  );
  data.set("runset.reading", "true");
  data.set("runset.tableOrder.v1", "kind");
  data.set("runset.language", "zh-CN");
  const game = practiceGame(),
    raw = exportProfile(game, localStorage),
    restored = importProfile(raw);
  expect(restored.game).toEqual(game);
  expect(restored.game).not.toBe(game);
  expect(restored.values).toEqual(Object.fromEntries(data));
  expect(importProfile(exportProfile(null, localStorage)).game).toBeNull();
});
it("rejects arbitrary, unsupported and damaged nested data before writing anything", () => {
  const raw = JSON.parse(exportProfile(practiceGame(), localStorage));
  for (const patch of [
    { version: 2 },
    { game: { ...practiceGame(), pool: [] } },
    { values: { [SAVE_KEY]: "raw" } },
    { values: { "runset.reading": "yes" } },
    { values: { "runset.tableOrder.v1": "manual" } },
    {
      values: {
        "runset.turnPractice.v1": JSON.stringify({
          version: 1,
          mode: "quiet",
          showSteps: false,
          lesson: "unknown",
          actions: [],
        }),
      },
    },
    { values: { "runset.pace": "1" } },
    {
      values: {
        "runset.exercises.v1": JSON.stringify({
          version: 1,
          kind: "opening",
          checked: false,
          game: practiceGame(),
        }),
      },
    },
  ])
    expect(() => importProfile(JSON.stringify({ ...raw, ...patch }))).toThrow();
  expect(() => importProfile("{bad")).toThrow();
  expect(() => importProfile(" ".repeat(2 * 1024 * 1024 + 1))).toThrow();
  expect(data.size).toBe(0);
  expect(() =>
    exportProfile(null, {
      getItem() {
        throw Error("denied");
      },
    }),
  ).toThrow("The profile could not be exported.");
  expect(validProfileValue("runset.audioVoice", "device")).toBe(true);
  expect(validProfileValue("runset.audioVoice", "unknown")).toBe(false);
  expect(
    validProfileValue(
      "runset.turnPractice.v1",
      JSON.stringify({
        ...freshTurnPractice().record,
        padding: " ".repeat(65536),
      }),
    ),
  ).toBe(false);
});
it("restores a profile through the existing save guard and preserves original timers", async () => {
  const current = practiceGame(),
    incoming = practiceGame("jokers");
  incoming.turnSeconds = 120;
  incoming.deadline = 123456789;
  expect((await persistGame(current)).ok).toBe(true);
  expect(
    (
      await persistGame(incoming, {
        "runset.language": "zh-CN",
        "runset.reading": "true",
      })
    ).ok,
  ).toBe(true);
  expect(JSON.parse(data.get(SAVE_KEY)!)).toEqual(incoming);
  expect(JSON.parse(data.get(BACKUP_KEY)!)).toEqual(current);
  expect(data.get("runset.reading")).toBe("true");
});
it("rolls back the game, recovery and profile keys if an optional write fails", async () => {
  const old = practiceGame(),
    next = practiceGame("jokers");
  await persistGame(old);
  data.set("runset.reading", "false");
  data.set(BACKUP_KEY, "original recovery");
  const before = new Map(data);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => data.delete(key),
    setItem: (key: string, value: string) => {
      if (key === "runset.language" && value === "zh-CN") throw Error("quota");
      data.set(key, value);
    },
  });
  expect(
    await persistGame(next, {
      "runset.reading": "true",
      "runset.language": "zh-CN",
    }),
  ).toEqual({ ok: false, reason: "storage" });
  expect(data).toEqual(before);
  expect((await persistGame(old)).ok).toBe(true);
});
it("keeps the game for profile-only restore and rejects stale or cancelled commits", async () => {
  const old = practiceGame();
  await persistGame(old);
  const raw = data.get(SAVE_KEY);
  expect((await persistGame(null, { "runset.reading": "true" })).ok).toBe(true);
  expect(data.get(SAVE_KEY)).toBe(raw);
  const abort = new AbortController();
  abort.abort();
  expect(
    (await persistGame(null, { "runset.reading": "false" }, abort.signal)).ok,
  ).toBe(false);
  expect(data.get("runset.reading")).toBe("true");
  data.set(SAVE_KEY, JSON.stringify(practiceGame("jokers")));
  expect(await persistGame(old, { "runset.reading": "false" })).toEqual({
    ok: false,
    reason: "conflict",
  });
  expect(data.get("runset.reading")).toBe("true");
  expect((await persistGame(old, { [SAVE_KEY]: "bad" })).ok).toBe(false);
});
