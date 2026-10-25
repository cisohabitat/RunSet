import { newGame, type GameState } from "./game";
import { tiles } from "./tiles";
export type Lesson = "basics" | "jokers" | "rearrange";
export function practiceGame(lesson: Lesson = "basics"): GameState {
  const s = newGame("You", 1, "easy", 4321);
  s.current = 0;
  s.players.sort((a, b) => Number(!!a.bot) - Number(!!b.bot));
  s.table =
    lesson === "jokers"
      ? [{ id: "practice-wild", tiles: [3, 104, 5] }]
      : lesson === "rearrange"
        ? [{ id: "practice-run", tiles: [0, 1, 2, 3, 4] }]
        : [];
  s.players[0].rack =
    lesson === "basics"
      ? [9, 35, 61, 0, 1, 2, 12, 25, 51, 77, 103, 78, 80, 82]
      : lesson === "jokers"
        ? [4, 30, 56, 82, 12]
        : [5, 6, 12, 25, 51];
  s.players[0].melded = lesson !== "basics";
  const used = new Set([
      ...s.players[0].rack,
      ...s.table.flatMap((m) => m.tiles),
    ]),
    rest = tiles.map((t) => t.id).filter((id) => !used.has(id));
  s.players[1].rack = rest.splice(0, 14);
  s.pool = rest;
  s.turnStart = {
    table: structuredClone(s.table),
    rack: [...s.players[0].rack],
  };
  s.log = ["Practice uses its own tiles. Your saved game is safe."];
  return s;
}
