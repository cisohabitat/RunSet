import { newGame, type GameState } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
/** Maximum populated workspace: 50 table + 50 rack + 6 opponent = 106 IDs. */
export function stressPosition(): GameState {
  const s = newGame("You", 1, "easy", 8123, { coach: false });
  s.players.sort((a, b) => Number(!!a.bot) - Number(!!b.bot));
  s.current = 0;
  s.players[0].melded = true;
  s.table = [
    { id: "red", tiles: Array.from({ length: 13 }, (_, i) => i) },
    { id: "blue", tiles: Array.from({ length: 13 }, (_, i) => 26 + i) },
    { id: "orange", tiles: Array.from({ length: 13 }, (_, i) => 52 + i) },
    { id: "black", tiles: Array.from({ length: 11 }, (_, i) => 78 + i) },
  ];
  const used = new Set(s.table.flatMap((m) => m.tiles));
  const rest = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => !used.has(id),
  );
  s.players[0].rack = rest.splice(0, 50);
  s.players[1].rack = rest;
  s.pool = [];
  s.turnStart = {
    table: structuredClone(s.table),
    rack: [...s.players[0].rack],
  };
  s.history = Array.from({ length: 100 }, () => structuredClone(s.turnStart));
  if (!validSave(s)) throw Error("Invalid stress fixture");
  return s;
}
