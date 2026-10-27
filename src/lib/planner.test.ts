import { afterEach, expect, it, vi } from "vitest";
import { practiceGame } from "../engine/practice";
import { runPlanner } from "./planner";
afterEach(() => vi.unstubAllGlobals());
for (const kind of ["bot", "hint"] as const)
  it(`${kind} worker receives no other racks, log or Undo history`, async () => {
    const game = practiceGame("rearrange"),
      before = JSON.stringify(game),
      controller = new AbortController();
    let instance: FakeWorker;
    class FakeWorker {
      onmessage?: (e: { data: unknown }) => void;
      onerror?: () => void;
      sent: { game: typeof game; kind: string } | undefined;
      terminated = false;
      constructor() {
        instance = this;
      }
      postMessage(data: { game: typeof game; kind: string }) {
        this.sent = data;
      }
      terminate() {
        this.terminated = true;
      }
    }
    vi.stubGlobal("Worker", FakeWorker);
    const promise =
      kind === "bot"
        ? runPlanner(game, "bot", controller.signal)
        : runPlanner(game, "hint", controller.signal);
    instance!.onmessage!({ data: { ready: true } });
    const safe = instance!.sent!.game;
    expect(instance!.sent!.kind).toBe(kind);
    expect(safe.players[0].rack).toEqual(game.players[0].rack);
    expect(safe.players[1].rack).toEqual([]);
    expect(safe.history).toEqual([]);
    expect(safe.log).toEqual([]);
    expect(safe.table).toEqual(game.table);
    expect(JSON.stringify(game)).toBe(before);
    instance!.onmessage!({ data: { result: [] } });
    await expect(promise).resolves.toEqual([]);
    expect(instance!.terminated).toBe(true);
  });
