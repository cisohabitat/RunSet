import { newGame, type GameState } from "../src/engine/game";
import type { Meld } from "../src/engine/meld";

/** Complete physical inventory; the empty pool makes every failed play a pass. */
export function endgamePosition(
  rack: number[],
  table: Meld[],
  opened = true,
): GameState {
  const s = newGame("Opponent", 1, "hard", 800001);
  s.players[0] = {
    name: "Computer",
    bot: "hard",
    rack: [...rack],
    melded: opened,
  };
  const used = new Set([...rack, ...table.flatMap((m) => m.tiles)]);
  s.players[1] = {
    name: "Opponent",
    bot: null,
    rack: Array.from({ length: 106 }, (_, id) => id).filter(
      (id) => !used.has(id),
    ),
    melded: true,
  };
  s.current = 0;
  s.pool = [];
  s.table = structuredClone(table);
  s.turnStart = { table: structuredClone(table), rack: [...rack] };
  return s;
}

export function crowdedBorrow(reverse = false): GameState {
  const table: Meld[] = [{ id: "sevens", tiles: [6, 32, 58, 84] }];
  for (const n of [1, 2, 3, 4, 5, 9, 10, 11, 12, 13])
    table.push({
      id: `group-${n}`,
      tiles: [n - 1, 26 + n - 1, 52 + n - 1, 78 + n - 1],
    });
  for (let c = 0; c < 4; c++)
    table.push({
      id: `spare-run-${c}`,
      tiles: Array.from({ length: 13 }, (_, i) => c * 26 + 13 + i),
    });
  return endgamePosition([31, 33], reverse ? table.reverse() : table);
}

export function crowdedBorrowWithExtension(): GameState {
  const s = crowdedBorrow();
  s.table.find((m) => m.id === "group-13")!.tiles = s.table
    .find((m) => m.id === "group-13")!
    .tiles.filter((id) => id !== 12);
  s.players[0].rack.push(12);
  s.turnStart = {
    table: structuredClone(s.table),
    rack: [...s.players[0].rack],
  };
  return s;
}

export const endgameCases = () => [
  {
    id: "crowded-borrow-plus-baseline-extension",
    state: crowdedBorrowWithExtension(),
    finish: true,
  },
  { id: "crowded-borrow", state: crowdedBorrow(), finish: true },
  { id: "crowded-borrow-reversed", state: crowdedBorrow(true), finish: true },
  {
    id: "small-borrow",
    state: endgamePosition(
      [31, 33],
      [{ id: "sevens", tiles: [6, 32, 58, 84] }],
    ),
    finish: true,
  },
  {
    id: "duplicate-interior",
    state: endgamePosition([16], [{ id: "run", tiles: [0, 1, 2, 3, 4, 5, 6] }]),
    finish: true,
  },
  {
    id: "joker-replace-reuse",
    state: endgamePosition([4, 6, 7], [{ id: "run", tiles: [3, 104, 5] }]),
    finish: true,
  },
  {
    id: "unopened-below-thirty",
    state: endgamePosition(
      [0, 1, 2],
      [{ id: "run", tiles: [26, 27, 28] }],
      false,
    ),
    finish: false,
  },
  {
    id: "joker-without-replacement",
    state: endgamePosition([33, 34], [{ id: "run", tiles: [3, 4, 5, 104] }]),
    finish: false,
  },
];
