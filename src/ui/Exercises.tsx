import { useEffect, useRef, useState } from "react";
import {
  exerciseClue,
  exerciseClueText,
  exerciseDescription,
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
import {
  completeSolo,
  mergeSolo,
  emptySolo,
  validSolo,
  type SoloProgress,
} from "../lib/soloProgress";
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
      p.game.players.length === 2 &&
      p.game.players[0].bot === null &&
      p.game.turn === 1 &&
      p.game.phase === "playing" &&
      !p.game.turnSeconds &&
      !p.game.match &&
      JSON.stringify(p.game.turnStart) ===
        JSON.stringify(exerciseGame(p.kind, p.game.seed).turnStart)
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
function initialSolo(): { progress: SoloProgress; recovered: boolean } {
  try {
    const raw = localStorage.getItem("runset.solo.v1");
    if (raw === null) return { progress: emptySolo(), recovered: false };
    const p = JSON.parse(raw);
    if (validSolo(p)) return { progress: p, recovered: false };
  } catch {
    /* Invalid optional records must not prevent play. */
  }
  return { progress: emptySolo(), recovered: true };
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
  const puzzlePicker = useRef<HTMLDetailsElement>(null);
  const [numberError, setNumberError] = useState("");
  const [puzzleNumber, setPuzzleNumber] = useState(() =>
    String(session?.game.seed ?? 4321),
  );
  const [solo, setSolo] = useState(initialSolo);
  const [soloSaveError, setSoloSaveError] = useState(false);
  useEffect(() => {
    const changed = (e: StorageEvent) => {
      if (e.key !== "runset.solo.v1" || !e.newValue) return;
      try {
        const p = JSON.parse(e.newValue);
        if (validSolo(p))
          setSolo((old) => ({ ...old, progress: mergeSolo(old.progress, p) }));
      } catch {
        /* Keep the current valid optional record. */
      }
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("runset.solo.v1", JSON.stringify(solo.progress));
      setSoloSaveError(false);
    } catch {
      setSoloSaveError(true);
    }
  }, [solo.progress]);
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
  const pageRef = useRef<HTMLElement>(null);
  const focusKey = session
    ? `${session.kind}-${attempt}-${session.checked}`
    : "choose";
  const previousFocus = useRef(focusKey);
  useEffect(() => {
    if (previousFocus.current === focusKey) return;
    previousFocus.current = focusKey;
    const frame = requestAnimationFrame(() => {
      if (document.querySelector("dialog[open]")) return;
      const selector =
        focusKey === "choose"
          ? "h1"
          : focusKey.endsWith("-true")
            ? ".exercise-goal h2[aria-live]"
            : ".exercise-goal h2";
      const heading = pageRef.current?.querySelector<HTMLElement>(selector);
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({ block: "nearest" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [focusKey]);
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
  const start = (kind: ExerciseKind, requested?: number) => {
    const raw =
      requested === undefined ? puzzleNumber.trim() : String(requested);
    const code = Number(raw);
    if (!/^[1-9][0-9]{0,5}$/.test(raw) || !Number.isInteger(code)) {
      setNumberError("Enter a puzzle number from 1 to 999999.");
      if (puzzlePicker.current) puzzlePicker.current.open = true;
      return;
    }
    setNumberError("");
    const game = exerciseGame(kind, code);
    setPuzzleNumber(String(code));
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
      setSolo((p) => ({
        ...p,
        progress: completeSolo(p.progress, session.kind, session.game.seed),
      }));
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
  const copy = session && exerciseDescription(session.kind, session.game.seed);
  return (
    <main
      ref={pageRef}
      id="main-content"
      tabIndex={-1}
      className="exercises page"
    >
      <button className="text-button" onClick={onExit}>
        {t("← Home")}
      </button>
      <h1>{t("Quick exercises")}</h1>
      <p>
        {t(
          "Practise one move at a time. No timer, no penalties. Your regular game is kept; its timer keeps running.",
        )}
      </p>
      <details className="puzzle-picker" ref={puzzlePicker}>
        <summary>
          {t("Puzzle number")}: {session?.game.seed ?? puzzleNumber}
        </summary>
        <p>
          {t(
            "Use the same number and exercise to replay the same starting tiles. Starting a puzzle replaces only the exercise draft.",
          )}
        </p>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            start(session?.kind ?? "opening");
          }}
        >
          <label>
            {t("Puzzle number")}{" "}
            <input
              aria-label={t("Puzzle number")}
              inputMode="numeric"
              maxLength={6}
              value={puzzleNumber}
              onChange={(e) => setPuzzleNumber(e.target.value)}
            />
          </label>
          <button className="secondary" type="submit">
            {t("Start this puzzle")}
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              const code =
                (crypto.getRandomValues(new Uint32Array(1))[0] % 999999) + 1;
              setPuzzleNumber(String(code));
              if (session) start(session.kind, code);
            }}
          >
            {t("New puzzle number")}
          </button>
        </form>
        <p role="status">{t(numberError)}</p>
      </details>
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
                onClick={() => start(session.kind, session.game.seed)}
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
                <p>{t(exerciseClueText(session.kind, session.game))}</p>
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
              embedded
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
      <details className="solo-progress">
        <summary>
          {t("Your local progress")} · {solo.progress.kinds.length} / 4
        </summary>
        <p>
          {t(
            "Progress stays on this device. No account or streak to maintain.",
          )}
        </p>
        <p>
          {t(
            `Saved completed puzzles: ${solo.progress.completed.length} (up to 200).`,
          )}
        </p>
        {solo.progress.kinds.length === 4 ? (
          <p role="status">
            {t("A lovely start: you have tried all four kinds of move!")}
          </p>
        ) : solo.progress.kinds.length > 0 ? (
          <p>
            {t(
              "Your first move is in the book. Try another when you feel like it.",
            )}
          </p>
        ) : null}
        <ul>
          {exerciseKinds.map((kind) => (
            <li key={kind}>
              {solo.progress.kinds.includes(kind) ? "✓ " : "○ "}
              {t(exerciseCopy[kind].title)}
            </li>
          ))}
        </ul>
      </details>
      {solo.recovered && (
        <p role="status">
          {t(
            "Local progress could not be restored. New progress will start here.",
          )}
        </p>
      )}
      {soloSaveError && (
        <p role="status">
          {t("Local progress could not be saved. You can keep playing.")}
        </p>
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
    </main>
  );
}
