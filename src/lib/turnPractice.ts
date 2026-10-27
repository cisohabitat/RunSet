import { reducer, type GameState } from "../engine/game";
import {
  turnLessons,
  turnLessonPosition,
  turnLessonReady,
  type TurnLesson,
} from "./turnLessons";
import { validTurnLayout } from "./turnLayouts";
import { validSave } from "./storage";
export const turnPracticeKey = "runset.turnPractice.v1";
export const maxPracticeActions = 256;
export type PracticeAction =
  | { type: "move"; ids: number[]; target: string }
  | { type: "sortRack"; by: "color" | "number" }
  | { type: "undo" | "resetTurn" | "draw" | "endTurn" };
export interface TurnPracticeRecord {
  version: 1;
  lesson?: TurnLesson;
  layout?: number;
  mode: "guided" | "quiet";
  showSteps: boolean;
  actions: PracticeAction[];
}
export interface TurnPracticeProgress {
  record: TurnPracticeRecord;
  game: GameState;
}
export function freshTurnPractice(
  mode: "guided" | "quiet" = "guided",
  name = "You",
  lesson: TurnLesson = "opening",
  layout = 0,
): TurnPracticeProgress {
  return {
    record: {
      version: 1,
      lesson,
      layout,
      mode,
      showSteps: mode === "guided",
      actions: [],
    },
    game: turnLessonPosition(lesson, name, layout),
  };
}
/** Only teaching actions, without clocks, plans, imported state or bot actions. */
export function practiceAction(value: unknown): PracticeAction | null {
  if (!value || typeof value !== "object") return null;
  const a = value as Record<string, unknown>;
  if (a.type === "move") {
    if (
      !Array.isArray(a.ids) ||
      !a.ids.length ||
      a.ids.length > 106 ||
      new Set(a.ids).size !== a.ids.length ||
      a.ids.some((id) => !Number.isInteger(id) || id < 0 || id >= 106) ||
      typeof a.target !== "string" ||
      a.target.length > 80
    )
      return null;
    return { type: "move", ids: [...a.ids], target: a.target };
  }
  if (a.type === "sortRack" && (a.by === "color" || a.by === "number"))
    return { type: "sortRack", by: a.by };
  if (
    typeof a.type === "string" &&
    ["undo", "resetTurn", "draw", "endTurn"].includes(a.type)
  )
    return { type: a.type as "undo" | "resetTurn" | "draw" | "endTurn" };
  return null;
}
export function practiceCanApply(
  game: GameState,
  action: PracticeAction,
  lesson: TurnLesson = "opening",
  layout = 0,
): boolean {
  if (game.current !== 0 || game.phase !== "playing") return false;
  if (action.type === "endTurn") return turnLessonReady(lesson, game, layout);
  if (action.type !== "move") return true;
  const available = [
    ...game.players[0].rack,
    ...game.table.flatMap((m) => m.tiles),
  ];
  return (
    action.ids.every((id) => available.includes(id)) &&
    (action.target === "new" ||
      action.target === "rack" ||
      game.table.some((m) => m.id === action.target))
  );
}
/** Rebuild only this known 106-tile fixture; never hydrate an arbitrary game. */
export function replayTurnPractice(
  value: unknown,
  name = "You",
): TurnPracticeProgress | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Partial<TurnPracticeRecord>;
  if (
    r.version !== 1 ||
    (r.mode !== "guided" && r.mode !== "quiet") ||
    typeof r.showSteps !== "boolean" ||
    !Array.isArray(r.actions) ||
    r.actions.length > maxPracticeActions
  )
    return null;
  const lesson = r.lesson ?? "opening",
    layout = r.layout === undefined ? 0 : r.layout;
  if (!turnLessons.includes(lesson) || !validTurnLayout(layout)) return null;
  let game = turnLessonPosition(lesson, name, layout);
  const actions: PracticeAction[] = [];
  for (const value of r.actions) {
    const action = practiceAction(value);
    if (!action || !practiceCanApply(game, action, lesson, layout)) return null;
    game = reducer(game, action);
    actions.push(action);
  }
  if (!validSave(game)) return null;
  return {
    record: {
      version: 1,
      lesson,
      layout,
      mode: r.mode,
      showSteps: r.showSteps,
      actions,
    },
    game,
  };
}
export function turnPracticeOutcome(
  game: GameState,
  lesson: TurnLesson = "opening",
): "playing" | "complete" | "drawn" {
  return game.current === 0 && game.phase === "playing"
    ? "playing"
    : game.lastPlaced.length || lesson === "draw"
      ? "complete"
      : "drawn";
}
