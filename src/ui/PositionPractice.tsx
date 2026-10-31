import { useEffect, useRef, useState } from "react";
import { type Action, type GameState } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import {
  positionPractice,
  positionPracticeAction,
} from "../lib/positionPractice";
import { useI18n } from "../i18n/I18n";
import { Game } from "./Game";
import { Tile } from "./Tile";
import "./PositionPractice.css";
export function PositionPractice({
  source,
  opener,
  onClose,
  guidance,
}: {
  source: GameState;
  opener: HTMLButtonElement | null;
  onClose: () => void;
  guidance?: { reason: string; next: string };
}) {
  const { t } = useI18n();
  const [initial] = useState(() => positionPractice(source));
  const [game, setGame] = useState(initial),
    [complete, setComplete] = useState(false),
    [attempt, setAttempt] = useState(0),
    [feedback, setFeedback] = useState("");
  const dialog = useRef<HTMLDialogElement>(null),
    done = useRef<HTMLButtonElement>(null),
    message = useRef<HTMLParagraphElement>(null),
    body = useRef<HTMLDivElement>(null),
    finishedHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();
    done.current?.focus();
    return () => {
      modal?.close();
      if (opener?.isConnected) {
        opener.focus({ preventScroll: true });
        requestAnimationFrame(() => {
          if (
            opener.isConnected &&
            document.activeElement === document.body &&
            !document.querySelector("dialog[open]")
          )
            opener.focus({ preventScroll: true });
        });
      }
    };
  }, [opener]);
  useEffect(() => {
    if (feedback) {
      message.current?.focus({ preventScroll: true });
      message.current?.scrollIntoView({ block: "nearest" });
    }
  }, [feedback]);
  useEffect(() => {
    if (complete) {
      finishedHeading.current?.focus({ preventScroll: true });
      finishedHeading.current?.scrollIntoView({ block: "nearest" });
    }
  }, [complete]);
  const dispatch = (action: Action) => {
    if (!game || complete) return;
    const next = positionPracticeAction(game, action);
    setGame(next.game);
    setComplete(next.complete);
    setFeedback(next.feedback);
  };
  return (
    <dialog
      ref={dialog}
      className="position-practice"
      aria-labelledby="position-practice-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="position-practice-title">{t("Practise this position")}</h2>
      </header>
      <div
        ref={body}
        className="position-practice-body"
        role="region"
        aria-label={t("Practice copy content")}
        tabIndex={0}
      >
        <p>
          {t(
            guidance
              ? "Practice copy only. Your saved game and selected tiles stay unchanged."
              : "Temporary copy. Practise with your rack and the public table. Your saved game and selected tiles stay unchanged.",
          )}
        </p>
        <p>
          {t(
            source.turnSeconds
              ? "Your real game timer keeps running. This copy closes if the real turn changes."
              : "This copy has no timer. Close or reload to discard its practice edits.",
          )}
        </p>
        {!guidance && <p>
          {t(
            "Unfinished moves are included. Undo affects only new practice moves; Reset returns to the start of the original turn. Unseen tiles and opponents are not played here.",
          )}
        </p>}
        {guidance && (
          <section aria-label={t("Correction to practise")}>
            <h3>{t("Correction to practise")}</h3>
            <p>{t(guidance.reason)}</p>
            <p>{t(guidance.next)}</p>
          </section>
        )}
        {feedback && (
          <p
            ref={message}
            tabIndex={-1}
            role="status"
            className="practice-feedback"
          >
            {t(feedback)}
          </p>
        )}
        {game && !complete ? (
          <Game
            key={attempt}
            game={game}
            dispatch={dispatch}
            onHelp={() =>
              setFeedback(
                "Make matching-number groups or consecutive same-colour runs. Keep every table meld valid, then check your turn.",
              )
            }
            coaching={false}
            embedded
            positionCopy
            practiceEndCheck
            muted
          />
        ) : complete && game ? (
          <section aria-label={t("Checked practice table")}>
            <h3 ref={finishedHeading} tabIndex={-1}>
              {t("This practice turn is valid")}
            </h3>
            <p>
              {t(
                "Return to your game to play the move there. Practice changes are never copied back.",
              )}
            </p>
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
                            info.values[id]
                              ? `${info.jokerColors[id]} ${info.values[id]}`
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </figure>
                );
              })}
            </div>
          </section>
        ) : (
          <p role="status">
            {t(
              "A practice copy is available only during your turn in a valid saved game.",
            )}
          </p>
        )}
        {guidance && (
          <details className="practice-copy-about">
            <summary>{t("About this practice copy")}</summary>
            <p>
              {t("Temporary copy. Practise with your rack and the public table. Your saved game and selected tiles stay unchanged.")}
            </p>
            <p>
              {t("Unfinished moves are included. Undo affects only new practice moves; Reset returns to the start of the original turn. Unseen tiles and opponents are not played here.")}
            </p>
          </details>
        )}
      </div>
      <footer className="dialog-actions">
        <button
          className="secondary"
          disabled={!initial}
          onClick={() => {
            setGame(initial);
            setComplete(false);
            setFeedback("");
            setAttempt((n) => n + 1);
            if (body.current) body.current.scrollTop = 0;
          }}
        >
          {t("Restart practice copy")}
        </button>
        <button ref={done} className="primary" onClick={onClose}>
          {t("Return to saved game")}
        </button>
      </footer>
    </dialog>
  );
}
