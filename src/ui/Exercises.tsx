import { useEffect, useRef, useState } from "react";
import {
  exerciseClue,
  exerciseComplete,
  exerciseCopy,
  exerciseGame,
  exerciseKinds,
  type ExerciseKind,
} from "../engine/exercises";
import {
  reducer,
  turnCheck,
  type Action,
  type GameState,
} from "../engine/game";
import { validSave } from "../lib/storage";
import { sound, transitionCue } from "../lib/sound";
import { useI18n } from "../i18n/I18n";
import { Game } from "./Game";
import { TileDemo } from "./Tile";
import { ReadAloud } from "./ReadAloud";
import "./Exercises.css";
interface Session {
  version: 1;
  kind: ExerciseKind;
  game: GameState;
  checked: boolean;
}
const key = "runset.exercises.v1";
function initial(): Session | null {
  try {
    const p = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      p?.version === 1 &&
      exerciseKinds.includes(p.kind) &&
      validSave(p.game) &&
      p.game.current === 0 &&
      p.game.turn === 1 &&
      p.game.phase === "playing" &&
      !p.game.turnSeconds &&
      !p.game.match &&
      JSON.stringify(p.game.turnStart) ===
        JSON.stringify(exerciseGame(p.kind).turnStart)
    )
      return {
        ...p,
        checked: p.checked === true && exerciseComplete(p.kind, p.game),
      };
  } catch {
    /* Optional practice must remain usable without storage. */
  }
  return null;
}
export default function Exercises({
  onExit,
  muted,
}: {
  onExit: () => void;
  muted: boolean;
}) {
  const { t, locale } = useI18n();
  const [session, setSession] = useState(initial);
  const [recovered] = useState(() => {
    try {
      return localStorage.getItem(key) !== null && !initial();
    } catch {
      return false;
    }
  });
  const [clue, setClue] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const previous = useRef(session);
  useEffect(() => {
    const before = previous.current;
    previous.current = session;
    if (
      before &&
      session &&
      before.kind === session.kind &&
      before.game.turnStart === session.game.turnStart
    ) {
      const cue = transitionCue(before.game, session.game);
      if (cue) sound(cue, muted);
    }
    try {
      if (session) localStorage.setItem(key, JSON.stringify(session));
      else localStorage.removeItem(key);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [session, muted]);
  const start = (kind: ExerciseKind) => {
    const game = exerciseGame(kind);
    if (locale === "zh-CN") game.players[0].name = "你";
    setSession({ version: 1, kind, game, checked: false });
    setClue(false);
    setFeedback("");
    setAttempt((n) => n + 1);
  };
  const dispatch = (a: Action) => {
    if (!["move", "undo", "resetTurn", "sortRack"].includes(a.type)) return;
    setSession((p) =>
      p && !p.checked ? { ...p, game: reducer(p.game, a) } : p,
    );
    setFeedback("");
  };
  const check = () => {
    if (!session) return;
    if (exerciseComplete(session.kind, session.game)) {
      setSession({ ...session, checked: true });
      setFeedback("");
      sound("win", muted);
    } else {
      const result = turnCheck(session.game);
      setFeedback(
        result.valid
          ? "Keep going: complete the goal above, then check again."
          : result.reason || "Complete the goal above, then check again.",
      );
      sound("invalid", muted);
    }
  };
  const copy = session && exerciseCopy[session.kind];
  return (
    <div className="exercises page">
      <button className="text-button" onClick={onExit}>
        {t("← Home")}
      </button>
      <h1>{t("Quick exercises")}</h1>
      <p>
        {t(
          "Practise one move at a time. No timer, no penalties. Your regular game is kept; its timer keeps running.",
        )}
      </p>
      {!session ? (
        <div className="exercise-choices">
          {exerciseKinds.map((kind) => (
            <button
              className="secondary"
              key={kind}
              onClick={() => start(kind)}
            >
              {t(exerciseCopy[kind].title)} →
            </button>
          ))}
        </div>
      ) : (
        <>
          <section className="exercise-goal" aria-label={t("Exercise goal")}>
            <h2>{t(copy!.title)}</h2>
            <p>{t(copy!.goal)}</p>
            <ReadAloud text={t(copy!.goal)} />
            {session.kind === "opening" && (
              <p>
                {t("Opening:")} {turnCheck(session.game).points} / 30
              </p>
            )}
            <div className="exercise-actions">
              {!session.checked && (
                <button
                  className="secondary"
                  onClick={() => setClue((v) => !v)}
                  aria-expanded={clue}
                >
                  {t(clue ? "Hide clue" : "Show clue")}
                </button>
              )}
              <button
                className="text-button"
                onClick={() => start(session.kind)}
              >
                {t("Restart exercise")}
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setSession(null);
                  setFeedback("");
                  setClue(false);
                }}
              >
                {t("Choose another exercise")}
              </button>
            </div>
            {clue && !session.checked && (
              <div className="exercise-clue">
                <p>{t(copy!.clue)}</p>
                <div className="exercise-example">
                  <TileDemo ids={exerciseClue(session.kind, session.game)} />
                </div>
              </div>
            )}
            <p role="status">{t(feedback)}</p>
            {session.checked && (
              <>
                <h2 aria-live="polite">{t("Well done! Goal complete.")}</h2>
                <div className="exercise-solution">
                  {session.game.table.map((m) => (
                    <div className="exercise-example" key={m.id}>
                      <TileDemo ids={m.tiles} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
          {!session.checked && (
            <Game
              key={`${session.kind}-${attempt}`}
              game={session.game}
              dispatch={dispatch}
              onHelp={() => setClue(true)}
              coaching={false}
              suggested={clue ? exerciseClue(session.kind, session.game) : []}
              muted={muted}
              autoScrollLessonAction={false}
              lessonAction={{ label: "Check move", onClick: check }}
            />
          )}
        </>
      )}
      {recovered && (
        <p role="status">
          {t(
            "The saved exercise could not be restored. Choose an exercise to start again.",
          )}
        </p>
      )}
      {saveError && (
        <p role="status">
          {t(
            "Exercise progress could not be saved. You can keep practising here.",
          )}
        </p>
      )}
    </div>
  );
}
