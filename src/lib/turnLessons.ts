import { turnCheck, type GameState } from "../engine/game";
import { practiceGame } from "../engine/practice";
import { tiles } from "../engine/tiles";
import { applyTurnLayout, turnLayoutId, turnLayoutText } from "./turnLayouts";
export const turnLessons = [
  "opening",
  "extend",
  "rearrange",
  "joker",
  "draw",
] as const;
export type TurnLesson = (typeof turnLessons)[number];
export const turnLessonCopy: Record<
  TurnLesson,
  { title: string; goal: string; clue: string; success: string }
> = {
  opening: {
    title: "Opening",
    goal: "Make an opening worth at least 30 points, leave every group and run valid, then choose End turn. You decide when to finish.",
    clue: "Try the red 10, blue 10 and orange 10, then choose New group or run. Three different-colour 10s score 30 points.",
    success:
      "You made a valid opening of at least 30 points and chose End turn. Here is your finished table.",
  },
  extend: {
    title: "Add to a run",
    goal: "You have already opened. Add red 6 to the red 1–5 run, then choose End turn. There is no 30-point minimum after opening.",
    clue: "Select red 6 from your rack and choose the existing run as its destination.",
    success:
      "You extended the existing run with your red 6 and ended a valid turn.",
  },
  rearrange: {
    title: "Rearrange a whole turn",
    goal: "Split red 1–5 and use your red 6 and 7 to make red 1–3 and red 4–7. Then choose End turn with both runs valid.",
    clue: "Select the table's red 4 and 5 with your red 6 and 7, then choose New group or run.",
    success:
      "You split the original run, played from your rack and ended with both runs valid.",
  },
  joker: {
    title: "A whole turn with a joker",
    goal: "Replace the table joker's red 5 with your red 5. Reuse that joker with blue 5 and orange 5, then choose End turn.",
    clue: "Add red 5 to the existing run first. The joker stays on the table until you move it with blue 5 and orange 5 into a new group.",
    success:
      "You replaced the joker, reused it this turn and chose End turn with every group and run valid.",
  },
  draw: {
    title: "Choose when to draw",
    goal: "This rack has no complete group or run for an opening. Choose Draw a tile to take one tile and finish safely.",
    clue: "Choose Draw a tile. Drawing restores unfinished edits and ends your turn without a penalty.",
    success:
      "You chose Draw, took exactly one tile and ended your turn without a penalty.",
  },
};
export function turnLessonPosition(
  lesson: TurnLesson,
  name: string,
  layout = 0,
): GameState {
  const game = practiceGame(
    lesson === "joker"
      ? "jokers"
      : lesson === "extend" || lesson === "rearrange"
        ? "rearrange"
        : "basics",
  );
  game.players[0].name = name;
  if (lesson === "draw") {
    game.players[0].rack = [0, 2, 4, 6, 8, 10, 12];
    const rest = tiles
      .map((t) => t.id)
      .filter((id) => !game.players[0].rack.includes(id));
    game.players[1].rack = rest.splice(0, 14);
    game.pool = rest;
    game.turnStart = { table: [], rack: [...game.players[0].rack] };
  }
  return applyTurnLayout(game, layout);
}
export function turnLessonReady(
  lesson: TurnLesson,
  game: GameState,
  layout = 0,
): boolean {
  const check = turnCheck(game),
    ids = (values: number[]) => values.map((id) => turnLayoutId(id, layout));
  if (!check.valid || !check.played.length) return false;
  const has = (values: number[]) =>
    game.table.some(
      (m) =>
        m.tiles.length === values.length &&
        ids(values).every((id) => m.tiles.includes(id)),
    );
  if (lesson === "rearrange") return has([0, 1, 2]) && has([3, 4, 5, 6]);
  if (lesson === "joker") return has([3, 4, 5]) && has([104, 30, 56]);
  if (lesson === "extend")
    return game.table.some((m) =>
      ids([0, 1, 2, 3, 4, 5]).every((id) => m.tiles.includes(id)),
    );
  return lesson === "opening";
}
export function turnLessonLayoutCopy(lesson: TurnLesson, layout = 0) {
  const copy = turnLessonCopy[lesson];
  return {
    title: copy.title,
    goal: turnLayoutText(copy.goal, layout),
    clue: turnLayoutText(copy.clue, layout),
    success: turnLayoutText(copy.success, layout),
  };
}
export function turnLessonClue(
  lesson: TurnLesson,
  game: GameState,
  layout = 0,
): { ids: number[]; target: string } {
  const ids = (values: number[]) =>
    values.map((id) => turnLayoutId(id, layout));
  if (lesson === "extend") return { ids: ids([5]), target: "practice-run" };
  if (lesson === "rearrange") return { ids: ids([3, 4, 5, 6]), target: "new" };
  if (lesson === "joker")
    return game.table.some(
      (m) =>
        m.id === "practice-wild" && m.tiles.includes(turnLayoutId(4, layout)),
    )
      ? { ids: ids([104, 30, 56]), target: "new" }
      : { ids: ids([4]), target: "practice-wild" };
  return {
    ids: lesson === "opening" ? ids([9, 35, 61]) : [],
    target: lesson === "draw" ? "draw" : "new",
  };
}
