import { type GameState, reducer, turnCheck } from "./game";
import { inspectMeld, type Meld } from "./meld";
import { rackPlan, repartition } from "./solver";
import { tiles } from "./tiles";
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
/** Extend without splitting; every intermediate proposal must pass the turn validator. */
function extendGreedily(s: GameState, input: Meld[], deadline: number): Meld[] {
  let table = input;
  let left = s.players[s.current].rack.filter(
    (id) => !table.some((m) => m.tiles.includes(id)),
  );
  let changed = true;
  while (changed && performance.now() < deadline) {
    changed = false;
    for (const id of left) {
      if (performance.now() >= deadline) break;
      for (let index = 0; index < table.length; index++) {
        if (performance.now() >= deadline) break;
        if (!inspectMeld([...table[index].tiles, id]).valid) continue;
        const candidate = table.map((m, i) =>
          i === index ? { ...m, tiles: [...m.tiles, id] } : m,
        );
        if (!legalPlan(s, candidate)) continue;
        table = candidate;
        left = left.filter((x) => x !== id);
        changed = true;
        break;
      }
      if (changed) break;
    }
  }
  return table;
}
/** Try alternate first extensions, retaining the legal greedy baseline on timeout. */
function improveExtensions(
  s: GameState,
  base: Meld[],
  baseline: Meld[],
  deadline: number,
): Meld[] {
  const rack = s.players[s.current].rack;
  let best = baseline,
    bestCount = best.flatMap((m) => m.tiles).length;
  if (rack.every((id) => best.some((m) => m.tiles.includes(id)))) return best;
  const left = rack.filter((id) => !base.some((m) => m.tiles.includes(id)));
  const searchDeadline = Math.min(deadline, performance.now() + 20);
  for (const id of left)
    for (let index = 0; index < base.length; index++) {
      if (performance.now() >= searchDeadline) return best;
      if (!inspectMeld([...base[index].tiles, id]).valid) continue;
      const first = base.map((m, i) =>
        i === index ? { ...m, tiles: [...m.tiles, id] } : m,
      );
      if (!legalPlan(s, first)) continue;
      const candidate = extendGreedily(
        s,
        first,
        Math.min(searchDeadline, performance.now() + 3),
      );
      const count = candidate.flatMap((m) => m.tiles).length;
      if (count > bestCount) {
        best = candidate;
        bestCount = count;
      }
      if (rack.every((tile) => best.some((m) => m.tiles.includes(tile))))
        return best;
    }
  return best;
}
/** Look for small rack repairs before repartitioning an entire board.
 * Unrelated public melds and already-played rack tiles remain intact. Timeout
 * retains the best validated plan; every candidate uses the full turn validator.
 */
function localRepair(s: GameState, baseline: Meld[], deadline: number): Meld[] {
  const rack = s.players[s.current].rack;
  const remaining = (table: Meld[]) =>
    rack.filter((id) => !table.some((m) => m.tiles.includes(id)));
  if (remaining(baseline).length > 8) return baseline;
  let best = baseline;
  const localDeadline = Math.min(deadline, performance.now() + 35);
  const sources = baseline
    .map((source, index) => ({ source, index }))
    .sort((a, b) => a.source.tiles.length - b.source.tiles.length);
  for (const { source, index } of sources) {
    if (performance.now() >= localDeadline) break;
    const left = remaining(baseline);
    const related = source.tiles.some(
      (id) =>
        tiles[id].joker ||
        left.some(
          (r) =>
            tiles[r].joker ||
            (tiles[r].color === tiles[id].color &&
              Math.abs(tiles[r].num - tiles[id].num) <= 2),
        ) ||
        left.some(
          (r) =>
            tiles[r].num === tiles[id].num &&
            left.some(
              (other) =>
                other !== r &&
                tiles[other].num === tiles[r].num &&
                tiles[other].color !== tiles[r].color,
            ),
        ),
    );
    if (!related) continue;
    const join = (local: Meld[]) => {
      const used = new Set(
        baseline.filter((m) => m !== source).map((m) => m.id),
      );
      const replacement = local.map((m, i) => {
        let id = `finish-${s.turn}-${index}-${i}`;
        while (used.has(id)) id += "-";
        used.add(id);
        return { id, tiles: m.tiles };
      });
      return baseline.flatMap((m) => (m === source ? replacement : [m]));
    };
    const local = repartition(
      [source],
      left,
      Math.max(0, Math.min(6, localDeadline - performance.now())),
      (candidate) => {
        const table = join(candidate);
        return legalPlan(s, table);
      },
    );
    if (local) {
      const proposal = join(local);
      if (remaining(proposal).length < remaining(best).length) best = proposal;
      if (!remaining(best).length) return best;
    }
  }
  return best;
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
      p.bot === "normal" || p.bot === "hard",
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
  if (p.melded && p.bot !== "easy") {
    const base = table;
    table = extendGreedily(s, base, deadline);
    table = improveExtensions(s, base, table, deadline);
  }
  if (!legalPlan(s, table)) table = structuredClone(s.table);
  // No partition can improve on a valid rack-empty finish.
  if (p.rack.every((id) => table.some((m) => m.tiles.includes(id))))
    return table;
  if (p.melded && p.bot === "hard") {
    table = localRepair(s, table, deadline);
    if (p.rack.every((id) => table.some((m) => m.tiles.includes(id))))
      return table;
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
