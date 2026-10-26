import { useEffect, useRef, useState } from "react";
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
    [storageNotice, setStorageNotice] = useState(""),
    [attempt, setAttempt] = useState(0);
  const { lesson, step, game } = progress;
  const [feedback, setFeedback] = useState(""),
    [selectionTip, setSelectionTip] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (feedback || selectionTip)
      feedbackRef.current?.scrollIntoView({ block: "nearest" });
    else panelRef.current?.scrollTo({ top: 0 });
  }, [lesson, step, attempt, feedback, selectionTip]);
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
        ? game.table.some((m) => m.id === "practice-wild" && m.tiles.includes(4))
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
    setAttempt((value) => value + 1);
    setFeedback("");
    setSelectionTip("");
    update({ lesson, step: 0, game: practiceGame(lesson) });
  };
  const basics = [
    [
      "Make a group",
      "Select the three 10s below → New group or run. Groups match numbers in different colours.",
    ],
    [
      "Make a run",
      "Select red 1, 2 and 3 → New group or run. A run has consecutive numbers in one colour.",
    ],
    [
      "Your first 30 points",
      "Your 10s score 30. Red 1 + 2 + 3 adds 6. Your opening is 36 points; at least 30 is required.",
    ],
    [
      "Finish your turn",
      "Choose End turn. You played tiles from your rack and left every group and run valid.",
    ],
    [
      "Watch the opponent",
      "Juniper will draw from the pool: the shared pile of face-down tiles. Drawing ends a turn.",
    ],
    [
      "Try drawing",
      "Choose Draw a tile. Drawing resets unfinished edits, adds one tile to your rack, and ends your turn.",
    ],
    [
      "Try an incomplete play",
      "Place red 13 → New group or run, then Reset. Invalid End draws 3 penalty tiles; Reset is free.",
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
          "Add red 5 to the run to replace its joker. Then place the joker, blue 5 and orange 5 in a new group. A retrieved joker must be reused this turn.",
        ]
      : [
          "Split a run",
          "Select the table’s red 4 and 5 plus your red 6 and 7 → New group or run. You’ll leave red 1–3 and make red 4–7. Rearrange only after opening.",
        ];
  const instructions = lesson === "basics" ? basics[step] : advanced;
  const finished =
    lesson === "basics" ? step === 7 : lessonComplete(lesson, game);
  const dispatch = (action: Action) => {
    setFeedback("");
    if (
      lesson === "basics" &&
      ((action.type === "endTurn" && step !== 3) ||
        (action.type === "draw" && step !== 5))
    ) {
      setFeedback(`First finish this step: ${instructions[1]} No turn or penalty was applied.`);
      return;
    }
    if (lesson !== "basics" && ["endTurn", "draw"].includes(action.type)) {
      setFeedback(
        "Finish the highlighted exercise first, or restart the lesson. No turn or penalty was applied.",
      );
      return;
    }
    if (
      action.type === "move" &&
      action.target !== "rack" &&
      (action.ids.some((id) => !objective.ids.includes(id)) ||
        (action.target !== objective.target &&
          !(lesson === "basics" && step <= 1 && game.table.some((m) =>
            m.id === action.target && m.tiles.every((id) => objective.ids.includes(id)),
          ))))
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

    }
    update({ lesson, step: nextStep, game: next });
  };
  return (
    <div data-lesson={lesson} className={`practice-layout ${finished ? "" : "playing"}`}>
      <section ref={panelRef} className="practice-panel" aria-label="Guided practice">
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
        <div className="practice-copy">
        <p id="practice-instructions" aria-live="polite">
          {instructions[1]}
        </p>
        <progress
          aria-label="Practice progress"
          max={7}
          value={lesson === "basics" ? Math.min(step + 1, 7) : finished ? 7 : 0}
        />
        {(feedback || selectionTip) && (
          <p ref={feedbackRef} className="practice-feedback" role="status">
            {feedback || selectionTip}
          </p>
        )}
        {storageNotice && <p role="status">{storageNotice}</p>}
        </div>
        <div className="practice-actions">
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
          key={`${lesson}-${attempt}-${game.turn}`}
          coaching={false}
          lessonAction={lesson === "basics" && (step === 2 || step === 4) ? {
            label: step === 2 ? "I see: 30 + 6 = 36 →" : "Watch Juniper draw →",
            onClick: () => update(step === 2
              ? { ...progress, step: 3 }
              : { ...progress, step: 5, game: reducer(game, { type: "draw" }) }),
          } : undefined}
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
