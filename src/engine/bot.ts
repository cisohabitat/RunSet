import { type GameState, reducer, turnCheck } from "./game";
import { inspectMeld, type Meld } from "./meld";
import { rackPlan, repartition } from "./solver";
export function planBot(s: GameState, budget = 380): Meld[] {
  const started = performance.now(),
    p = s.players[s.current],
    initial = rackPlan(p.rack, !p.melded, Math.min(90, budget / 4));
  if (!p.melded && initial.points < 30) return s.table;
  let melds = initial.melds;
  if (
    p.bot === "easy" &&
    p.melded &&
    melds.length > 1 &&
    (s.seed + s.turn) % 3 === 0
  )
    melds = melds.slice(0, 1);
  let table = [
    ...structuredClone(s.table),
    ...melds.map((tiles, i) => ({ id: `bot-${s.turn}-${i}`, tiles })),
  ];
  let left = p.rack.filter((id) => !table.some((m) => m.tiles.includes(id)));
  if (p.melded && p.bot !== "easy") {
    let changed = true;
    while (changed) {
      changed = false;
      for (const id of left) {
        const target = table.find((m) => inspectMeld([...m.tiles, id]).valid);
        if (target) {
          target.tiles.push(id);
          left = left.filter((x) => x !== id);
          changed = true;
          break;
        }
      }
    }
  }
  if (p.melded && p.bot === "hard") {
    const hard = repartition(
      s.table,
      p.rack,
      Math.max(0, budget - (performance.now() - started)),
    );
    if (
      hard &&
      hard.flatMap((m) => m.tiles).length > table.flatMap((m) => m.tiles).length
    ) {
      const trial = {
        ...s,
        table: hard,
        players: s.players.map((x, i) =>
          i === s.current
            ? {
                ...x,
                rack: x.rack.filter(
                  (id) => !hard.some((m) => m.tiles.includes(id)),
                ),
              }
            : x,
        ),
      };
      if (turnCheck(trial).valid) table = hard;
    }
  }
  return table;
}
export const botTurn = (s: GameState, budget?: number) =>
  reducer(s, { type: "botTurn", table: planBot(s, budget) });
