import { reducer, turnCheck, type GameState } from "./game";
import { practiceGame } from "./practice";
import { tiles } from "./tiles";
export const exerciseKinds = ["opening", "extend", "repair", "joker"] as const;
export type ExerciseKind = (typeof exerciseKinds)[number];
export const exerciseCopy: Record<
  ExerciseKind,
  { title: string; goal: string; clue: string }
> = {
  opening: {
    title: "Open with 30 points",
    goal: "Make a group of three 10s in different colours. Their total is 30: enough to open.",
    clue: "Select the three 10s, then choose New group or run.",
  },
  extend: {
    title: "Extend a run",
    goal: "Add red 4 to the red 1, 2, 3 run already on the table.",
    clue: "Select red 4, then choose the existing run as its destination.",
  },
  repair: {
    title: "Fill the gap",
    goal: "The red 1 and 3 need a 2 between them. Complete the run before checking your move.",
    clue: "Add red 2 to the incomplete run. After Reset, select red 1, 2 and 3 together and make a new run.",
  },
  joker: {
    title: "Replace and reuse a joker",
    goal: "Replace the joker in red 4, joker, 6 with red 5. Then use that joker with blue 5 and orange 5 in a new group.",
    clue: "First add red 5 to the existing run. Then select the freed joker, blue 5 and orange 5 and choose New group or run.",
  },
};
export function exerciseGame(kind: ExerciseKind): GameState {
  let s = practiceGame();
  s.table =
    kind === "extend"
      ? [{ id: "exercise-run", tiles: [0, 1, 2] }]
      : kind === "joker"
        ? [{ id: "exercise-wild", tiles: [3, 104, 5] }]
        : [];
  s.players[0].rack =
    kind === "opening"
      ? [9, 35, 61, 0, 1, 2, 12]
      : kind === "extend"
        ? [3, 12, 25]
        : kind === "repair"
          ? [0, 1, 2, 12]
          : [4, 30, 56, 12];
  s.players[0].melded = kind !== "opening";
  const used = new Set([
    ...s.players[0].rack,
    ...s.table.flatMap((m) => m.tiles),
  ]);
  const rest = tiles.map((t) => t.id).filter((id) => !used.has(id));
  s.players[1].rack = rest.splice(0, 14);
  s.pool = rest;
  s.turnStart = {
    table: structuredClone(s.table),
    rack: [...s.players[0].rack],
  };
  if (kind === "repair")
    s = reducer(s, { type: "move", ids: [0, 2], target: "new" });
  return s;
}
export function exerciseComplete(kind: ExerciseKind, s: GameState): boolean {
  const check = turnCheck(s);
  if (!check.valid) return false;
  const has = (ids: number[]) =>
    s.table.some(
      (m) =>
        m.tiles.length === ids.length &&
        ids.every((id) => m.tiles.includes(id)),
    );
  if (kind === "opening") return has([9, 35, 61]) && check.points >= 30;
  if (kind === "extend") return has([0, 1, 2, 3]);
  if (kind === "repair") return has([0, 1, 2]);
  return has([3, 4, 5]) && has([104, 30, 56]);
}
export function exerciseClue(kind: ExerciseKind, s: GameState): number[] {
  if (kind === "opening") return [9, 35, 61];
  if (kind === "extend") return [3];
  if (kind === "repair")
    return s.table.some((m) => m.tiles.includes(0)) ? [1] : [0, 1, 2];
  return s.table.some((m) => m.tiles.includes(4)) ? [104, 30, 56] : [4];
}
