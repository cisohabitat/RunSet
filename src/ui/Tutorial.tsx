import { useState } from "react";
import {
  basicProgress,
  lessonComplete,
  practiceGame,
  type Lesson,
} from "../engine/practice";
import {
  reducer,
  turnCheck,
  type GameState,
  type Action,
} from "../engine/game";
import { tiles } from "../engine/tiles";
import { inspectMeld } from "../engine/meld";
import { validSave } from "../lib/storage";
import { Game } from "./Game";
interface Progress {
  lesson: Lesson;
  step: number;
  game: GameState;
}
const key = "runset.practice.v1";
function initial(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      p &&
      ["basics", "jokers", "rearrange"].includes(p.lesson) &&
      Number.isInteger(p.step) &&
      p.step >= 0 &&
      p.step <= 7 &&
      validSave(p.game)
    ) {
      // Older practice saves may be waiting for End turn after Reset or Undo
      // removed an opening meld. Resume at the objective the table supports.
      if (p.lesson === "basics" && p.step <= 3) {
        const completed = basicProgress(p.game);
        return { ...p, step: p.step === 3 && completed === 2 ? 3 : completed };
      }
      return p;
    }
  } catch {
    /* Practice is optional. */
  }
  return { lesson: "basics", step: 0, game: practiceGame() };
}
export default function Tutorial({
  onExit,
  onPlay,
}: {
  onExit: () => void;
  onPlay: () => void;
}) {
  const [progress, setProgress] = useState(initial),
    [storageNotice, setStorageNotice] = useState("");
  const { lesson, step, game } = progress;
  const [feedback, setFeedback] = useState(""),
    [selectionTip, setSelectionTip] = useState("");
  const invalid = game.table.some((m) => !inspectMeld(m.tiles).valid);
  const objective =
    lesson === "basics"
      ? {
          ids:
            step === 0
              ? [9, 35, 61]
              : step === 1
                ? [0, 1, 2]
                : step === 6
                  ? [12]
                  : [],
          target:
            step === 3
              ? "end"
              : step === 5
                ? "draw"
                : step === 6 && invalid
                  ? "reset"
                  : "new",
        }
      : lesson === "jokers"
        ? game.table.some((m) => m.tiles.includes(4))
          ? { ids: [104, 30, 56], target: "new" }
          : { ids: [4], target: "practice-wild" }
        : { ids: [3, 4, 5, 6], target: "new" };
  const labels = objective.ids
    .map((id) =>
      tiles[id].joker ? "the joker" : `${tiles[id].color} ${tiles[id].num}`,
    )
    .join(", ");
  const selectionChanged = (ids: number[]) => {
    setSelectionTip(
      ids.some((id) => !objective.ids.includes(id))
        ? `For this step, select ${labels}. Other tiles can wait.`
        : "",
    );
    if (ids.length) setFeedback("");
  };
  const update = (next: Progress) => {
    setProgress(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setStorageNotice(
        "Practice progress cannot be saved in this browser. Your regular game is unchanged.",
      );
    }
  };
  const choose = (lesson: Lesson) => {
    setFeedback("");
    setSelectionTip("");
    update({ lesson, step: 0, game: practiceGame(lesson) });
  };
  const basics = [
    [
      "Make a group",
      "Your rack is the row of tiles you hold. Select the three 10s in red, blue, and orange, then choose New group or run. A group matches numbers, with a different colour on every tile.",
    ],
    [
      "Make a run",
      "Select red 1, 2, and 3, then choose New group or run. A run has at least three consecutive numbers in the same colour. The table is where everyone places groups and runs.",
    ],
    [
      "Your first 30 points",
      "Your three 10s are worth 10 + 10 + 10 = 30. Your red run adds 1 + 2 + 3 = 6. That is 36 points, enough to open. Later turns can play fewer points.",
    ],
    [
      "Finish your turn",
      "Choose End turn. You played at least one tile and every group and run is valid. That is a legal turn.",
    ],
    [
      "Watch the opponent",
      "Juniper draws one tile from the pool, the shared pile of face-down tiles. Drawing ends a turn. You can draw even if a play is available.",
    ],
    [
      "Try drawing",
      "Choose Draw a tile. You get one tile from the pool and your turn ends immediately. Any unfinished table edits are reset first.",
    ],
    [
      "Try an incomplete play",
      "Select red 13 and choose New group or run. One tile is not a valid group or run. In a regular game, ending this turn would restore your tiles and draw up to three penalty tiles. Here, use Reset turn to fix it freely.",
    ],
    [
      "You know the basics",
      "Empty your rack to win. On each turn, play tiles or draw one. Your first play needs 30 points; after that you can add to or rearrange the table. Try an Easy game, or explore the optional lessons.",
    ],
  ];
  const advanced =
    lesson === "jokers"
      ? [
          "Retrieve a joker",
          "The star in the red 4–6 run represents red 5. Add your red 5 to that run. Then select the star, blue 5, and orange 5 and place a new group. Every tile must remain in a valid group or run.",
        ]
      : [
          "Split a run",
          "The table has red 1–5. Select the table’s red 4 and 5 plus your red 6 and 7, and place a new run. You now have red 1–3 and red 4–7. Rearranging is allowed after your 30-point opening.",
        ];
  const instructions = lesson === "basics" ? basics[step] : advanced;
  const finished =
    lesson === "basics" ? step === 7 : lessonComplete(lesson, game);
  const dispatch = (action: Action) => {
    setFeedback("");
    if (lesson !== "basics" && ["endTurn", "draw"].includes(action.type)) {
      setFeedback(
        "Finish the highlighted exercise first, or restart the lesson. No turn or penalty was applied.",
      );
      return;
    }
    if (
      action.type === "move" &&
      action.target !== "rack" &&
      action.ids.some((id) => !objective.ids.includes(id))
    ) {
      setFeedback(
        `This exercise uses ${labels}. Select those tiles and choose the outlined destination.`,
      );
      return;
    }

    if (
      lesson === "basics" &&
      action.type === "endTurn" &&
      !turnCheck(game).valid
    ) {
      setStorageNotice(
        `Practice tip: ${turnCheck(game).reason} Keep editing or reset; no penalty has been applied.`,
      );
      return;
    }

    let next = reducer(game, action),
      nextStep = step;
    if (lesson === "basics") {
      const table = next.table.flatMap((m) => m.tiles);
      if (step === 0 && [9, 35, 61].every((id) => table.includes(id)))
        nextStep = 1;
      else if (step === 1 && [0, 1, 2].every((id) => table.includes(id)))
        nextStep = 2;
      else if (step === 3 && next.current !== game.current) nextStep = 4;
      else if (step === 5 && action.type === "draw") {
        if (next.current !== 0) next = reducer(next, { type: "draw" });
        nextStep = 6;
      } else if (
        step === 6 &&
        action.type === "resetTurn" &&
        game.table.some((m) => m.tiles.length < 3)
      )
        nextStep = 7;
      if (step <= 3 && ["move", "undo", "resetTurn"].includes(action.type)) {
        const completed = basicProgress(next);
        nextStep = step === 3 && completed === 2 ? 3 : completed;
      }

      if (action.type === "endTurn" && step !== 3) return;
      if (action.type === "draw" && step !== 5) return;
    }
    update({ lesson, step: nextStep, game: next });
  };
  return (
    <div className={`practice-layout ${finished ? "" : "playing"}`}>
      <section className="practice-panel" aria-label="Guided practice">
        <div className="practice-top">
          <span className="eyebrow">
            {lesson === "basics"
              ? `FIRST GAME · ${Math.min(step + 1, 7)} / 7`
              : "OPTIONAL LESSON"}{" "}
            · SAVED GAME UNCHANGED
          </span>
          <button className="text-button" onClick={onExit}>
            Exit practice
          </button>
        </div>
        <h1>{instructions[0]}</h1>
        <p id="practice-instructions" aria-live="polite">
          {instructions[1]}
        </p>
        <progress
          aria-label="Practice progress"
          max={7}
          value={lesson === "basics" ? Math.min(step + 1, 7) : finished ? 7 : 0}
        />
        {(feedback || selectionTip) && (
          <p className="practice-feedback" role="status">
            {feedback || selectionTip}
          </p>
        )}
        {storageNotice && <p role="status">{storageNotice}</p>}
        <div className="practice-actions">
          {step === 2 && lesson === "basics" && (
            <button
              className="primary"
              onClick={() => update({ ...progress, step: 3 })}
            >
              I see: 30 + 6 = 36 →
            </button>
          )}
          {step === 4 && lesson === "basics" && (
            <button
              className="primary"
              onClick={() =>
                update({
                  ...progress,
                  step: 5,
                  game: reducer(game, { type: "draw" }),
                })
              }
            >
              Watch Juniper draw →
            </button>
          )}
          {finished && (
            <button className="primary" onClick={onPlay}>
              Play against one Easy opponent →
            </button>
          )}
          <button className="text-button" onClick={() => choose(lesson)}>
            Restart lesson
          </button>
          <button className="text-button" onClick={() => choose("basics")}>
            Basics
          </button>
          <button className="text-button" onClick={() => choose("jokers")}>
            Jokers
          </button>
          <button className="text-button" onClick={() => choose("rearrange")}>
            Rearranging
          </button>
        </div>
      </section>
      {!finished && (
        <Game
          key={`${lesson}-${game.turn}`}
          coaching={false}
          coachTarget={objective.target}
          onSelectionChange={selectionChanged}
          game={game}
          dispatch={dispatch}
          onHelp={onExit}
          suggested={objective.ids}
        />
      )}
    </div>
  );
}
