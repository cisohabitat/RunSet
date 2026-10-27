import { landscapePosition } from "./landscape";
import { reducer } from "../../src/engine/game";
export function reviewPosition() {
  let s = landscapePosition();
  delete s.match;
  delete s.turnSeconds;
  delete s.deadline;
  s.coach = false;
  s.current = 1;
  s.players[1].rack = [22, 48, 74, 24];
  s.turnStart = { table: structuredClone(s.table), rack: [22, 48, 74, 24] };
  const used = new Set([
    ...s.table.flatMap((m) => m.tiles),
    ...s.players.flatMap((p) => p.rack),
  ]);
  s.pool = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => !used.has(id),
  );
  s = reducer(s, {
    type: "botTurn",
    table: [...s.table, { id: "last-play", tiles: [22, 48, 74] }],
  });
  return reducer(s, { type: "move", ids: [22], target: "new" });
}
