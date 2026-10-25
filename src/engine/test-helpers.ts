import { expect } from "vitest";
import { newGame, type GameState } from "./game";
import { tiles } from "./tiles";
import type { Meld } from "./meld";
export function fixture(
  rack: number[],
  table: Meld[] = [],
  melded = false,
): GameState {
  const s = newGame("You", 1, "normal", 42);
  s.current = s.players.findIndex((p) => p.bot === null);
  s.players[s.current].rack = rack;
  s.players[s.current].melded = melded;
  s.table = structuredClone(table);
  s.turnStart = { rack: [...rack], table: structuredClone(table) };
  const used = new Set([...rack, ...table.flatMap((m) => m.tiles)]),
    rest = tiles.map((t) => t.id).filter((id) => !used.has(id));
  s.players[1 - s.current].rack = rest.splice(0, 14);
  s.pool = rest;
  return s;
}
export function conserved(s: GameState) {
  const ids = [
    ...s.pool,
    ...s.players.flatMap((p) => p.rack),
    ...s.table.flatMap((m) => m.tiles),
  ];
  expect(ids).toHaveLength(106);
  expect(new Set(ids).size).toBe(106);
}
