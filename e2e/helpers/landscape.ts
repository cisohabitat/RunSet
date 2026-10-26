import { newGame } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
export function landscapePosition(crowded = false, bots = 1) {
  const s = newGame("You", bots, "easy", 4321, {
    coach: true,
    target: 500,
    turnSeconds: 120,
    now: Date.now(),
  });
  s.players.sort((a, b) => Number(!!a.bot) - Number(!!b.bot));
  s.current = 0;
  s.players[0].melded = true;
  s.table = [
    { id: "red-run", tiles: [0, 1, 2] },
    { id: "tens", tiles: [9, 35, 61] },
    { id: "blue-run", tiles: [26, 27, 28] },
    { id: "orange-run", tiles: [52, 53, 54] },
    { id: "black-run", tiles: [78, 79, 80] },
    { id: "elevens", tiles: [10, 36, 62] },
  ];
  s.players[0].rack = [3, 4, 5, 6, 7, 8, 12, 25, 51, 77, 103, 104, 105];
  const used = new Set([
    ...s.players[0].rack,
    ...s.table.flatMap((m) => m.tiles),
  ]);
  const rest = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => !used.has(id),
  );
  for (const p of s.players.slice(1)) {
    p.rack = rest.splice(0, 14);
    if (bots > 1) p.name = "Long opponent name 三位对手";
  }
  s.pool = rest;
  if (crowded) s.players[0].rack.push(...s.pool.splice(0, 37));
  s.turnStart = {
    table: structuredClone(s.table),
    rack: [...s.players[0].rack],
  };
  if (!validSave(s)) throw Error("Invalid landscape fixture");
  return s;
}
