import { type GameState, reducer, turnCheck } from "./game";
import { inspectMeld, type Meld } from "./meld";
import { rackPlan, repartition } from "./solver";
// Leave headroom for validation, allocation and worker/runtime overhead.
export const BOT_WORK_BUDGET_MS = 240;
function legalPlan(s: GameState, table: Meld[]): boolean {
  const ids = table.flatMap((m) => m.tiles);
  const available = new Set([
    ...s.table.flatMap((m) => m.tiles),
    ...s.players[s.current].rack,
  ]);
  if (
    new Set(ids).size !== ids.length ||
    new Set(table.map((m) => m.id)).size !== table.length ||
    ids.some((id) => !available.has(id))
  )
    return false;
  return turnCheck({
    ...s,
    table,
    players: s.players.map((p, i) =>
      i === s.current
        ? { ...p, rack: p.rack.filter((id) => !ids.includes(id)) }
        : p,
    ),
  }).valid;
}
export function planBot(s: GameState, budget = 380): Meld[] {
  const started = performance.now(),
    requested = Number.isFinite(budget) ? Math.max(0, budget) : 380,
    deadline = started + Math.min(BOT_WORK_BUDGET_MS, requested),
    p = s.players[s.current],
    initial = rackPlan(
      p.rack,
      !p.melded,
      Math.min(90, requested / 4, Math.max(0, deadline - performance.now())),
    );
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
    while (changed && performance.now() < deadline) {
      changed = false;
      for (const id of left) {
        if (performance.now() >= deadline) break;
        const target = table.findIndex((m, index) => {
          if (!inspectMeld([...m.tiles, id]).valid) return false;
          const candidate = table.map((meld, i) =>
            i === index ? { ...meld, tiles: [...meld.tiles, id] } : meld,
          );
          return legalPlan(s, candidate);
        });
        if (target >= 0) {
          table[target].tiles.push(id);
          left = left.filter((x) => x !== id);
          changed = true;
          break;
        }
      }
    }
  }
  if (!legalPlan(s, table)) table = structuredClone(s.table);
  // No partition can improve on a valid rack-empty finish.
  if (p.rack.every((id) => table.some((m) => m.tiles.includes(id))))
    return table;
  if (p.melded && p.bot === "hard") {
    const hard = repartition(
      s.table,
      p.rack,
      Math.max(0, deadline - performance.now()),
      (candidate) => legalPlan(s, candidate),
    );
    if (
      hard &&
      hard.flatMap((m) => m.tiles).length > table.flatMap((m) => m.tiles).length
    ) {
      table = hard;
    }
  }
  return table;
}
export const botTurn = (s: GameState, budget?: number) =>
  reducer(s, { type: "botTurn", table: planBot(s, budget) });
