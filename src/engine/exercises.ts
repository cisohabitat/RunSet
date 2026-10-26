import { reducer, turnCheck, type GameState } from "./game";
import { practiceGame } from "./practice";
import { tiles, random, shuffle } from "./tiles";
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
function baseGame(kind: ExerciseKind): GameState {
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
/** Puzzle numbers change colours and values while preserving a known legal solution. */
export function exerciseMap(
  kind: ExerciseKind,
  code = 4321,
): (id: number) => number {
  if (!Number.isInteger(code) || code < 1 || code > 999999)
    throw new RangeError("Invalid puzzle number");
  if (code === 4321) return (id) => id;
  const rng = random(code);
  const colours = shuffle([0, 1, 2, 3], rng);
  const start =
    kind === "opening"
      ? 10 + Math.floor(rng() * 4)
      : kind === "joker"
        ? 3 + Math.floor(rng() * 8)
        : 1 + Math.floor(rng() * 9);
  return (id) => {
    if (id >= 104) return id;
    let colour = Math.floor(id / 26),
      value = (id % 13) + 1;
    const copy = id % 26 >= 13 ? 13 : 0;
    if (kind === "opening") {
      if ([9, 35, 61].includes(id)) value = start;
      // Keep the distractor distinct from a possible red 13 goal.
      if (id === 12) {
        colour = 3;
        value = 1;
      }
    } else if (kind === "joker") {
      if ([3, 4, 5].includes(id)) value = start + id - 4;
      if ([30, 56].includes(id)) value = start;
    } else if ([0, 1, 2, 3].includes(id)) value = start + id;
    return colours[colour] * 26 + copy + value - 1;
  };
}
export function exerciseGame(kind: ExerciseKind, code = 4321): GameState {
  if (code === 4321) return baseGame(kind);
  const s = baseGame(kind),
    map = exerciseMap(kind, code);
  const snapshot = (p: GameState["turnStart"]): GameState["turnStart"] => ({
    table: p.table.map((m) => ({ ...m, tiles: m.tiles.map(map) })),
    rack: p.rack.map(map),
  });
  s.table = s.table.map((m) => ({ ...m, tiles: m.tiles.map(map) }));
  s.players[0].rack = shuffle(s.players[0].rack.map(map), random(code));
  s.turnStart = snapshot(s.turnStart);
  // Initial rack ordering is part of a reproducible deal, not of the rules.
  s.turnStart.rack = [...s.turnStart.rack].sort(
    (a, b) => s.players[0].rack.indexOf(a) - s.players[0].rack.indexOf(b),
  );
  s.history = s.history?.map(snapshot);
  const used = new Set([
    ...s.players[0].rack,
    ...s.table.flatMap((m) => m.tiles),
  ]);
  const rest = shuffle(
    tiles.map((t) => t.id).filter((id) => !used.has(id)),
    random(code),
  );
  s.players[1].rack = rest.splice(0, 14);
  s.pool = rest;
  s.seed = code;
  return s;
}
export function exerciseDescription(
  kind: ExerciseKind,
  code = 4321,
): (typeof exerciseCopy)[ExerciseKind] {
  if (code === 4321) return exerciseCopy[kind];
  const map = exerciseMap(kind, code),
    label = (id: number) => `${tiles[map(id)].color} ${tiles[map(id)].num}`;
  const next =
    kind === "opening" || kind === "joker"
      ? "Select the pictured tiles, then choose New group or run."
      : "Select the pictured tiles, then choose the existing run.";
  let goal: string;
  if (kind === "opening") {
    const n = tiles[map(9)].num;
    goal = `Make a group of three ${n}s in different colours. Their total is ${3 * n}: enough to open.`;
  } else if (kind === "extend")
    goal = `Add ${label(3)} to the ${label(0)}, ${label(1)}, ${label(2)} run already on the table.`;
  else if (kind === "repair")
    goal = `The ${label(0)} and ${label(2)} need ${label(1)} between them. Complete the run before checking your move.`;
  else
    goal = `Replace the joker with ${label(4)}. Then use it with ${label(30)} and ${label(56)} in a new group.`;
  return { ...exerciseCopy[kind], goal, clue: next };
}
export function exerciseComplete(kind: ExerciseKind, s: GameState): boolean {
  const map = exerciseMap(kind, s.seed);
  const check = turnCheck(s);
  if (!check.valid) return false;
  const has = (ids: number[]) =>
    s.table.some(
      (m) =>
        m.tiles.length >= ids.length &&
        ids.every((id) => m.tiles.includes(map(id))),
    );
  if (kind === "opening") return has([9, 35, 61]) && check.points >= 30;
  if (kind === "extend") return has([0, 1, 2, 3]);
  if (kind === "repair") return has([0, 1, 2]);
  return has([3, 4, 5]) && has([104, 30, 56]);
}
function baseClue(kind: ExerciseKind, s: GameState): number[] {
  if (kind === "opening") return [9, 35, 61];
  if (kind === "extend") return [3];
  if (kind === "repair")
    return s.table.some((m) => m.tiles.includes(exerciseMap(kind, s.seed)(0)))
      ? [1]
      : [0, 1, 2];
  return s.table.some((m) => m.tiles.includes(exerciseMap(kind, s.seed)(4)))
    ? [104, 30, 56]
    : [4];
}

export function exerciseClue(kind: ExerciseKind, s: GameState): number[] {
  return baseClue(kind, s).map(exerciseMap(kind, s.seed));
}
export function exerciseClueText(kind: ExerciseKind, s: GameState): string {
  if (s.seed === 4321) return exerciseCopy[kind].clue;
  const ids = exerciseClue(kind, s);
  return ids.length >= 3
    ? "Select the pictured tiles, then choose New group or run."
    : "Select the pictured tiles, then choose the existing run.";
}
