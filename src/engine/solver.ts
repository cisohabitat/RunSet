import { tiles, colors } from "./tiles";
import { inspectMeld, type Meld } from "./meld";
// Enumerate groups and runs, including duplicate physical tiles, within a deadline.
export function candidates(
  ids: number[],
  anchor?: number,
  deadline = Infinity,
): number[][] {
  const points = new Map<string, number>();
  const found = new Map<string, number[]>(),
    jokers = ids.filter((id) => tiles[id].joker);
  const add = (meld: number[]) => {
    if (
      (anchor === undefined || meld.includes(anchor)) &&
      inspectMeld(meld).valid
    ) {
      const key = [...meld].sort((a, b) => a - b).join(",");
      found.set(key, meld);
      points.set(meld.join(","), inspectMeld(meld).points);
    }
  };
  const choose = (
    options: number[][],
    at: number,
    used: number[],
    missing: number,
    finish: (x: number[]) => void,
  ) => {
    if (performance.now() > deadline) return;
    if (at === options.length) {
      finish(used);
      return;
    }
    const opts = options[at];
    if (opts.length) {
      const choices =
        anchor !== undefined && opts.includes(anchor)
          ? [anchor, ...opts]
          : opts;
      for (const id of new Set(choices))
        choose(options, at + 1, [...used, id], missing, finish);
    }
    if (missing < jokers.length)
      for (const joker of jokers)
        if (!used.includes(joker))
          choose(options, at + 1, [...used, joker], missing + 1, finish);
  };
  groups: for (let n = 1; n <= 13; n++)
    for (let mask = 1; mask < 16; mask++) {
      if (performance.now() >= deadline) break groups;
      const cs = colors.filter((_, i) => mask & (1 << i));
      if (cs.length < 3) continue;
      choose(
        cs.map((c) =>
          ids.filter((id) => tiles[id].num === n && tiles[id].color === c),
        ),
        0,
        [],
        0,
        add,
      );
    }
  runs: for (const c of colors)
    for (let start = 1; start <= 11; start++)
      for (let end = start + 2; end <= 13; end++) {
        if (performance.now() >= deadline) break runs;
        const options = Array.from({ length: end - start + 1 }, (_, i) =>
          ids.filter(
            (id) => tiles[id].color === c && tiles[id].num === start + i,
          ),
        );
        if (options.filter((x) => !x.length).length > jokers.length) continue;
        choose(options, 0, [], 0, add);
      }
  return [...found.values()].sort(
    (a, b) =>
      b.length - a.length ||
      (points.get(b.join(",")) ?? 0) - (points.get(a.join(",")) ?? 0),
  );
}
export interface Plan {
  melds: number[][];
  used: number[];
  points: number;
}
export function rackPlan(
  rack: number[],
  opening: boolean,
  budget = 90,
  openingTilesFirst = false,
): Plan {
  const deadline = performance.now() + budget,
    options = candidates(rack, undefined, deadline),
    memo = new Set<string>();
  let best: Plan = { melds: [], used: [], points: 0 };
  function visit(
    left: number[],
    melds: number[][],
    used: number[],
    points: number,
  ) {
    if (performance.now() > deadline) return;
    if (
      opening && !(openingTilesFirst && points >= 30 && best.points >= 30)
        ? points > best.points ||
          (points === best.points && used.length > best.used.length)
        : used.length > best.used.length ||
          (used.length === best.used.length && points > best.points)
    )
      best = { melds, used, points };
    if (!left.length) return;
    const key =
      [...left].sort((a, b) => a - b).join(",") +
      "|" +
      used.length +
      "|" +
      points;
    if (memo.has(key)) return;
    memo.add(key);
    const anchor = left[0];
    for (const meld of options) {
      if (performance.now() >= deadline) break;
      if (meld.includes(anchor) && meld.every((id) => left.includes(id)))
        visit(
          left.filter((id) => !meld.includes(id)),
          [...melds, meld],
          [...used, ...meld],
          points + inspectMeld(meld).points,
        );
    }
    visit(left.slice(1), melds, used, points);
  }
  visit(
    [...rack].sort((a, b) => a - b),
    [],
    [],
    0,
  );
  return best;
}
export function repartition(
  table: Meld[],
  rack: number[],
  budget: number,
  accept?: (plan: Meld[]) => boolean,
): Meld[] | null {
  const deadline = performance.now() + budget,
    mandatory = table.flatMap((m) => m.tiles),
    options = candidates(
      [...mandatory, ...rack],
      undefined,
      Math.min(deadline, performance.now() + 60),
    );
  let best: Meld[] | null = null,
    bestCount = 0;
  const memo = new Set<string>(),
    byTile = new Map(
      mandatory.map((id) => [id, options.filter((m) => m.includes(id))]),
    );
  function search(left: number[], remaining: number[], chosen: number[][]) {
    if (performance.now() >= deadline || bestCount === rack.length) return;
    const key =
      [...left, ...remaining].sort((a, b) => a - b).join(",") +
      (accept
        ? "|" +
          chosen
            .map((m) => m.join(","))
            .sort()
            .join(";")
        : "");
    if (memo.has(key)) return;
    memo.add(key);
    if (!left.length) {
      const extra = rackPlan(
          remaining,
          false,
          Math.max(0, Math.min(15, deadline - performance.now())),
        ),
        melds = [...chosen, ...extra.melds];
      const count = melds.flat().length - mandatory.length;
      if (count > bestCount) {
        const candidate = melds.map((tiles, i) => ({ id: `hard-${i}`, tiles }));
        if (!accept || accept(candidate)) {
          bestCount = count;
          best = candidate;
        }
      }
      return;
    }
    const anchor = left.reduce((a, b) =>
      byTile.get(a)!.length <= byTile.get(b)!.length ? a : b,
    );
    const available = new Set([...left, ...remaining]);
    for (const meld of byTile.get(anchor) ?? []) {
      if (performance.now() > deadline) break;
      if (meld.every((id) => available.has(id)))
        search(
          left.filter((id) => !meld.includes(id)),
          remaining.filter((id) => !meld.includes(id)),
          [...chosen, meld],
        );
    }
  }
  search(mandatory, rack, []);
  return best;
}
