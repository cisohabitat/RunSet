/// <reference lib="webworker" />
import { planBot } from "../engine/bot";
import { planHint } from "../engine/coaching";
import type { GameState } from "../engine/game";
self.onmessage = (
  event: MessageEvent<{ kind: "bot" | "hint"; game: GameState }>,
) => {
  try {
    self.postMessage({
      result:
        event.data.kind === "bot"
          ? planBot(event.data.game)
          : planHint(event.data.game),
    });
  } catch {
    self.postMessage({
      error: "The planner could not finish. Try again or draw a tile.",
    });
  }
};
