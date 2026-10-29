import { useEffect, useRef, useState } from "react";
import { reducer, turnCheck, type Action } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import { useI18n } from "../i18n/I18n";
import {
  freshTurnPractice,
  practiceResumeMessage,
  maxPracticeActions,
  practiceAction,
  practiceCanApply,
  replayTurnPractice,
  turnPracticeKey,
  turnPracticeOutcome,
  type TurnPracticeProgress,
} from "../lib/turnPractice";
import { sound, transitionCue } from "../lib/sound";
import { Game } from "./Game";
import { Tile } from "./Tile";
import { ReadAloud } from "./ReadAloud";
import "./TurnPractice.css";
import { turnLayoutCount } from "../lib/turnLayouts";
import {
  turnLessons,
  turnLessonCopy,
  turnLessonLayoutCopy,
  turnLessonClue,
  turnLessonReady,
  type TurnLesson,
} from "../lib/turnLessons";
const saveWarning =
  "Latest whole-turn practice changes cannot be saved in this browser. Your regular game is unchanged.";
function readPractice(name: string): {
  progress: TurnPracticeProgress;
  notice: string;
  restored: boolean;
} {
  try {
    const raw = localStorage.getItem(turnPracticeKey);
    if (!raw)
      return {
        progress: freshTurnPractice("guided", name),
        notice: "",
        restored: false,
      };
    const progress =
      raw.length <= 65536 ? replayTurnPractice(JSON.parse(raw), name) : null;
    if (progress) return { progress, notice: "", restored: true };
    return {
      progress: freshTurnPractice("guided", name),
      restored: false,
      notice:
        "The saved whole-turn practice could not be restored. A fresh practice table is ready; your other games and lessons are unchanged.",
    };
  } catch {
    return {
      progress: freshTurnPractice("guided", name),
      notice: saveWarning,
      restored: false,
    };
  }
}
export function TurnPractice({
  onExit,
  onPlay,
  onLessons,
  muted = true,
}: {
  onExit: () => void;
  onPlay: () => void;
  onLessons: () => void;
  muted?: boolean;
}) {
  const { t, locale } = useI18n();
  const practiceName = locale === "zh-CN" ? "你" : "You";
  const [initial] = useState(() => readPractice(practiceName));
  const [progress, setProgress] = useState(initial.progress),
    [notice, setNotice] = useState(initial.notice),
    [resumed, setResumed] = useState(initial.restored),
    [feedback, setFeedback] = useState(""),
    [attempt, setAttempt] = useState(0),
    [lessonChoice, setLessonChoice] = useState<TurnLesson>(
      initial.progress.record.lesson ?? "opening",
    );
  const panel = useRef<HTMLElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null),
    noticeRef = useRef<HTMLParagraphElement>(null);
  const announcedNotice = useRef("");
  useEffect(() => {
    if (!notice) announcedNotice.current = "";
    const target = feedback
      ? feedbackRef.current
      : notice && announcedNotice.current !== notice
        ? noticeRef.current
        : null;
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      if (!target.isConnected || document.querySelector("dialog[open]")) return;
      if (!feedback) announcedNotice.current = notice;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [feedback, notice]);
  const { game, record } = progress;
  const lesson = record.lesson ?? "opening",
    layout = record.layout ?? 0,
    copy = turnLessonLayoutCopy(lesson, layout),
    clue = turnLessonClue(lesson, game, layout);
  const check = turnCheck(game),
    outcome = turnPracticeOutcome(game, lesson),
    finished = outcome !== "playing",
    ready = turnLessonReady(lesson, game, layout),
    stage = finished ? outcome : ready ? "ready" : "building";
  const title =
    outcome === "complete"
      ? record.mode === "guided" && lesson === "opening"
        ? "Opening turn complete"
        : "Whole-turn practice complete"
      : outcome === "drawn"
        ? "Drawing ends your turn"
        : "Practise a whole turn";
  const goal =
    outcome === "complete"
      ? copy.success
      : outcome === "drawn"
        ? "Drawing is a normal way to end a turn. Restart to try this lesson's goal."
        : copy.goal;
  const prompt = ready
    ? lesson === "opening"
      ? "Your opening is ready. Choose End turn to complete this practice."
      : "Your lesson goal is ready. Choose End turn to finish this practice."
    : lesson === "opening" && game.table.length
      ? "Keep every group or run valid and reach 30 opening points. You can Undo or Reset and try again; your turn is still yours."
      : copy.clue;
  const previousStage = useRef("");
  useEffect(() => {
    const key = `${attempt}-${stage}`;
    if (previousStage.current === key) return;
    previousStage.current = key;
    const frame = requestAnimationFrame(() => {
      const heading = panel.current?.querySelector<HTMLElement>("h1");
      if (heading && !document.querySelector("dialog[open]")) {
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({ block: "nearest" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [stage, attempt]);
  const update = (next: TurnPracticeProgress) => {
    setProgress(next);
    try {
      if (next.record.actions.length > maxPracticeActions)
        throw new Error("practice limit");
      localStorage.setItem(turnPracticeKey, JSON.stringify(next.record));
      setNotice("");
    } catch {
      setNotice(saveWarning);
    }
  };
  const restart = (
    mode = record.mode,
    nextLesson = lesson,
    nextLayout = layout,
  ) => {
    setAttempt((value) => value + 1);
    setLessonChoice(nextLesson);
    setResumed(false);
    setFeedback("");
    update(freshTurnPractice(mode, practiceName, nextLesson, nextLayout));
  };
  const dispatch = (value: Action) => {
    const action = practiceAction(value);
    if (!action || finished) return;
    setResumed(false);
    if (record.actions.length >= maxPracticeActions) {
      setNotice(
        "This practice has reached its saved move limit. Restart whole-turn practice to continue. Your regular game is unchanged.",
      );
      return;
    }
    if (!practiceCanApply(game, action, lesson, layout)) {
      setFeedback(
        action.type === "endTurn"
          ? check.valid
            ? "Finish this lesson's goal before ending the turn. No penalty was applied."
            : "Your turn is not ready. Keep editing or choose Reset. No penalty was applied."
          : "Choose tiles on this practice table or in your rack.",
      );
      return;
    }
    const next = reducer(game, action);
    const cue = transitionCue(game, next);
    if (cue) sound(cue, muted);
    setFeedback("");
    if (next === game) return;
    update({
      game: next,
      record: { ...record, actions: [...record.actions, action] },
    });
  };
  return (
    <main
      id="main-content"
      tabIndex={-1}
      data-lesson="whole-turn"
      className={`practice-layout ${finished ? "" : "playing"}`}
    >
      <section
        ref={panel}
        className="practice-panel"
        aria-label={t("Whole-turn practice")}
      >
        <div className="practice-top">
          <span className="eyebrow">
            {t(record.mode === "guided" ? "GUIDED TURN" : "FEWER PROMPTS")}{" "}
            {t("· SAVED GAME UNCHANGED")}
          </span>
          <button className="text-button" onClick={onExit}>
            {t("Exit practice")}
          </button>
        </div>
        <h1 tabIndex={-1}>{t(title)}</h1>
        <p>{t(copy.title)}</p>
        <p>{t(`Practice layout ${layout + 1} of 4`)}</p>
        <div className="practice-actions">
          <label>
            {t("Whole-turn lesson")}
            <select
              aria-label={t("Whole-turn lesson")}
              value={lessonChoice}
              onChange={(e) => setLessonChoice(e.target.value as TurnLesson)}
            >
              {turnLessons.map((value) => (
                <option key={value} value={value}>
                  {t(turnLessonCopy[value].title)}
                </option>
              ))}
            </select>
          </label>
          {lessonChoice !== lesson && (
            <>
              <p>
                {t(
                  "Starting this lesson replaces only your current whole-turn practice. Your regular game and short lessons are kept.",
                )}
              </p>
              <button
                className="secondary"
                onClick={() => restart("guided", lessonChoice)}
              >
                {t("Start selected lesson")}
              </button>
            </>
          )}
        </div>
        <div className="practice-copy">
          {resumed && (
            <p className="practice-restored" role="status">
              <strong>{t("Practice restored")}</strong>{" "}
              {t(practiceResumeMessage(initial.progress))}
            </p>
          )}
          <p id="practice-instructions">{t(goal)}</p>
          <ReadAloud text={`${t(title)}。${t(goal)}`} />
          {!finished && record.showSteps && (
            <p className="whole-turn-prompt" aria-live="polite">
              {t(prompt)}
            </p>
          )}
          {!finished && record.showSteps && game.table.length > 0 && !ready && (
            <p>{t(check.reason)}</p>
          )}
          {feedback && (
            <p
              ref={feedbackRef}
              tabIndex={-1}
              className="practice-feedback"
              role="status"
            >
              {t(feedback)}
            </p>
          )}
          {notice && (
            <p ref={noticeRef} tabIndex={-1} role="status">
              {t(notice)}
            </p>
          )}
        </div>
        <div className="practice-actions">
          {outcome === "complete" && record.mode === "guided" && (
            <button className="primary" onClick={() => restart("quiet")}>
              {t("Try with fewer prompts")}
            </button>
          )}
          {outcome === "complete" && (
            <button className="primary" onClick={onPlay}>
              {t("Play against one Easy opponent →")}
            </button>
          )}
          {!finished && (
            <button
              className="text-button"
              aria-pressed={record.showSteps}
              onClick={() =>
                update({
                  ...progress,
                  record: { ...record, showSteps: !record.showSteps },
                })
              }
            >
              {t(
                record.showSteps
                  ? "Hide practice steps"
                  : "Show practice steps",
              )}
            </button>
          )}
          <button
            className="text-button"
            onClick={() =>
              restart(record.mode, lesson, (layout + 1) % turnLayoutCount)
            }
          >
            {t("Start next practice layout")}
          </button>
          <p>
            {t(
              "Next layout starts a fresh whole-turn practice. Your regular game and short lessons are kept.",
            )}
          </p>
          <button className="text-button" onClick={() => restart()}>
            {t("Restart whole-turn practice")}
          </button>
          <button className="text-button" onClick={onLessons}>
            {t("Back to short lessons")}
          </button>
        </div>
        {outcome === "complete" && lesson !== "draw" && (
          <section
            className="practice-result"
            aria-label={t("Completed lesson table")}
          >
            <h2>{t("Your finished table")}</h2>
            <div className="practice-result-melds">
              {game.table.map((m) => {
                const info = inspectMeld(m.tiles);
                return (
                  <figure key={m.id}>
                    <div className="tile-demo">
                      {info.ordered.map((id) => (
                        <Tile
                          key={id}
                          id={id}
                          represents={
                            info.valid && info.jokerColors[id]
                              ? `${info.jokerColors[id]} ${info.values[id]}`
                              : undefined
                          }
                        />
                      ))}
                    </div>
                    <figcaption>
                      {t(info.kind === "run" ? "Run" : "Group")} · {info.points}
                      {t(" points · valid")}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </section>
        )}
      </section>
      {!finished && (
        <Game
          embedded
          practiceEndCheck
          coaching={false}
          muted={muted}
          key={`${attempt}-${record.mode}`}
          game={game}
          dispatch={dispatch}
          onHelp={onLessons}
          suggested={record.showSteps && !ready ? clue.ids : []}
          coachTarget={
            record.showSteps ? (ready ? "end" : clue.target) : undefined
          }
        />
      )}
    </main>
  );
}
