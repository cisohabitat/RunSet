import type { GameState } from "../engine/game";
import type { Meld } from "../engine/meld";
import type { Hint } from "../engine/coaching";
export function runPlanner(
  game: GameState,
  kind: "bot",
  signal: AbortSignal,
): Promise<Meld[]>;
export function runPlanner(
  game: GameState,
  kind: "hint",
  signal: AbortSignal,
): Promise<Hint>;
export function runPlanner(
  game: GameState,
  kind: "bot" | "hint",
  signal: AbortSignal,
): Promise<Meld[] | Hint> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Cancelled"));
      return;
    }
    const worker = new Worker(
      new URL("../workers/planner.ts", import.meta.url),
      { type: "module" },
    );
    const finish = () => {
      worker.terminate();
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
    };
    const abort = () => {
      finish();
      reject(new Error("Cancelled"));
    };
    const timeout = setTimeout(() => {
      finish();
      reject(new Error("Planning took too long. Try again or draw."));
    }, 2500);
    signal.addEventListener("abort", abort, { once: true });
    worker.onerror = () => {
      finish();
      reject(new Error("Planning is unavailable. You can still draw a tile."));
    };
    worker.onmessage = (e) => {
      finish();
      if (e.data.error) reject(new Error(e.data.error));
      else resolve(e.data.result);
    };
    const safe = structuredClone(game);
    safe.players.forEach((p, i) => {
      if (i !== safe.current) p.rack = [];
    });
    worker.postMessage({ game: safe, kind });
  });
}
