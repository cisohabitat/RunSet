import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { newGame, reducer } from "../engine/game";
import { loadGame, persistGame, SAVE_KEY, BACKUP_KEY } from "./storage";
let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal("navigator", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
  loadGame();
});
afterEach(() => vi.unstubAllGlobals());
it("a transient read failure preserves both copies and rejects queued or unseen replacements", async () => {
  const game = newGame("旧存档", 1, "easy", 9101, { turnSeconds: 120, now: 1000 });
  expect((await persistGame(game)).ok).toBe(true);
  data.set(BACKUP_KEY, "recovery bytes");
  const before = new Map(data), next = reducer(game, { type: "sortRack", by: "number", at: 2000 });
  let release: (() => void) | undefined;
  vi.stubGlobal("navigator", { locks: { request: (_name: string, work: () => unknown) => new Promise(resolve => { release = () => resolve(work()); }) } });
  const queued = persistGame(next);
  await vi.waitFor(() => expect(release).toBeTypeOf("function"));
  let failRead = true;
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => { if (failRead && key === SAVE_KEY) throw Error("read interrupted"); return data.get(key) ?? null; },
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
  expect(loadGame().notice).toMatch(/could not be read/);
  expect(data).toEqual(before);
  failRead = false;
  release!();
  expect(await queued).toEqual({ ok: false, reason: "conflict" });
  vi.stubGlobal("navigator", {});
  expect(await persistGame(next)).toEqual({ ok: false, reason: "conflict" });
  expect(data).toEqual(before);
  expect(loadGame().game).toEqual(game);
  expect((await persistGame(next)).ok).toBe(true);
  expect(JSON.parse(data.get(SAVE_KEY)!).deadline).toBe(game.deadline);
});
it("cancellation while waiting for a lock changes neither game nor profile and permits retry", async () => {
  const game = newGame("You", 1, "easy", 9102);
  await persistGame(game);
  const before = new Map(data), abort = new AbortController();
  let release: (() => void) | undefined;
  vi.stubGlobal("navigator", { locks: { request: (_name: string, work: () => unknown) => new Promise(resolve => { release = () => resolve(work()); }) } });
  const write = persistGame(null, { "runset.language": "zh-CN" }, abort.signal);
  await vi.waitFor(() => expect(release).toBeTypeOf("function"));
  abort.abort();
  release!();
  expect((await write).ok).toBe(false);
  expect(data).toEqual(before);
  vi.stubGlobal("navigator", {});
  expect((await persistGame(null, { "runset.language": "zh-CN" })).ok).toBe(true);
  expect(data.get(SAVE_KEY)).toBe(before.get(SAVE_KEY));
});
for (const failKey of [SAVE_KEY, "runset.reading", "runset.language"])
  it(`restores exact previous bytes after a one-off write failure at ${failKey}`, async () => {
    const old = newGame("原局", 1, "easy", 9103), next = newGame("新局", 1, "easy", 9104);
    await persistGame(old);
    data.set(BACKUP_KEY, "original backup");
    data.set("runset.reading", "false");
    const before = new Map(data);
    let fail = true;
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => { if (fail && key === failKey) { fail = false; throw Error("quota"); } data.set(key, value); },
      removeItem: (key: string) => data.delete(key),
    });
    expect(await persistGame(next, { "runset.reading": "true", "runset.language": "zh-CN" })).toEqual({ ok: false, reason: "storage" });
    expect(data).toEqual(before);
    expect((await persistGame(next, { "runset.reading": "true", "runset.language": "zh-CN" })).ok).toBe(true);
    expect(JSON.parse(data.get(SAVE_KEY)!)).toEqual(next);
    expect(data.get(BACKUP_KEY)).toBe(before.get(SAVE_KEY));
  });

it("cannot resurrect a remotely deleted save after a failed read", async () => {
  const old = newGame("You", 1, "easy", 9105);
  await persistGame(old);
  let blocked = true;
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => { if (blocked && key === SAVE_KEY) throw Error("read unavailable"); return data.get(key) ?? null; },
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
  expect(loadGame().unreadable).toBe(true);
  data.delete(SAVE_KEY);
  blocked = false;
  expect(await persistGame(old)).toEqual({ ok: false, reason: "conflict" });
  expect(data.has(SAVE_KEY)).toBe(false);
  expect(loadGame().game).toBeNull();
  expect((await persistGame(newGame("New", 1, "easy", 9106))).ok).toBe(true);
});
