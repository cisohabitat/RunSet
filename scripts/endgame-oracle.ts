import { reducer, turnCheck, type GameState } from "../src/engine/game";
import { inspectMeld, type Meld } from "../src/engine/meld";
import { tiles } from "../src/engine/tiles";

/** Constructive witnesses, not an exhaustive global solver or strength oracle.
 * Independent of production partition search: test literal transfers and splits.
 */
export function endgameWitness(s: GameState): Meld[] | null {
  const rack = s.players[s.current].rack;
  const accepted = (table: Meld[]) => {
    const next = reducer(s, { type: "applyPlan", table });
    return next !== s && turnCheck(next).valid ? table : null;
  };
  const freshId = (label: string) => {
    let id = label;
    while (s.table.some((m) => m.id === id)) id += "-";
    return id;
  };
  for (let i = 0; i < rack.length; i++)
    for (let j = i + 1; j < rack.length; j++) {
      const pair = [rack[i], rack[j]];
      for (const source of s.table) {
        if (inspectMeld([...source.tiles, ...pair]).valid) {
          const witness = accepted(
            s.table.map((m) =>
              m === source ? { ...m, tiles: [...m.tiles, ...pair] } : m,
            ),
          );
          if (witness) return witness;
        }
        if (!s.players[s.current].melded) continue;
        for (const borrowed of source.tiles) {
          if (!inspectMeld([borrowed, ...pair]).valid) continue;
          const rest = source.tiles.filter((id) => id !== borrowed);
          if (!inspectMeld(rest).valid) continue;
          const witness = accepted([
            ...s.table.map((m) => (m === source ? { ...m, tiles: rest } : m)),
            { id: freshId("audit-transfer"), tiles: [borrowed, ...pair] },
          ]);
          if (witness) return witness;
        }
      }
    }
  if (s.players[s.current].melded)
    for (const source of s.table) {
      const info = inspectMeld(source.tiles);
      if (info.kind !== "run" || source.tiles.some((id) => tiles[id].joker))
        continue;
      for (const id of rack) {
        const split = info.ordered.findIndex(
          (old) =>
            tiles[old].color === tiles[id].color &&
            tiles[old].num === tiles[id].num,
        );
        if (split < 0) continue;
        const left = info.ordered.slice(0, split + 1),
          right = [id, ...info.ordered.slice(split + 1)];
        if (!inspectMeld(left).valid || !inspectMeld(right).valid) continue;
        const witness = accepted([
          ...s.table.map((m) => (m === source ? { ...m, tiles: left } : m)),
          { id: freshId("audit-split"), tiles: right },
        ]);
        if (witness) return witness;
      }
    }
  return null;
}
