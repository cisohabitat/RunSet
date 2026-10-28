import { useEffect, useRef, useState } from "react";
import type { GameState } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import { tiles } from "../engine/tiles";
import { recentTurns, type PublicTurn } from "../lib/recentTurns";
import { useI18n } from "../i18n/I18n";
import { Tile } from "./Tile";
import "./RecentTurns.css";
export default function RecentTurns({
  game,
  epoch,
}: {
  game: GameState;
  epoch: number;
}) {
  const { t } = useI18n(),
    [frames, setFrames] = useState<PublicTurn[] | null>(null),
    [index, setIndex] = useState(0),
    [after, setAfter] = useState(true);
  const modal = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    close = useRef<HTMLButtonElement>(null);
  useEffect(() => setFrames(null), [game]);
  const open = frames !== null;
  useEffect(() => {
    if (!open) return;
    const dialog = modal.current,
      target = opener.current;
    dialog?.showModal();
    close.current?.focus();
    return () => {
      dialog?.close();
      if (target?.isConnected) {
        target.focus({ preventScroll: true });
        requestAnimationFrame(() => {
          if (
            target.isConnected &&
            document.activeElement === document.body &&
            !document.querySelector("dialog[open]")
          )
            target.focus({ preventScroll: true });
        });
      }
    };
  }, [open]);
  const frame = frames?.[index],
    table = frame ? (after ? frame.after : frame.before) : [];
  return (
    <>
      <button
        className="text-button"
        ref={opener}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          const history = recentTurns(game, epoch);
          setFrames(history);
          setIndex(Math.max(0, history.length - 1));
          setAfter(true);
        }}
      >
        {t("Replay recent turns")}
      </button>
      {open && (
        <dialog
          className="hint-preview recent-turns"
          ref={modal}
          aria-labelledby="recent-turns-title"
          onCancel={(e) => {
            e.preventDefault();
            setFrames(null);
          }}
        >
          <h2 id="recent-turns-title">{t("Recent public turns")}</h2>
          <p>
            {t(
              "Last six completed turns from this visit. Reloading or replacing a game clears this replay. Timed games keep running.",
            )}
          </p>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t("Recorded public table")}
            tabIndex={0}
          >
            {!frame ? (
              <p>
                {t(
                  "No completed turns recorded yet. Play a turn, then return here.",
                )}
              </p>
            ) : (
              <>
                <p role="status">
                  {t(`Turn ${frame.turn}`)} · <span>{frame.actor}</span> ·{" "}
                  {t(after ? "After turn" : "Before turn")}
                </p>
                <div className="replay-compare">
                  <button aria-pressed={!after} onClick={() => setAfter(false)}>
                    {t("Before turn")}
                  </button>
                  <button aria-pressed={after} onClick={() => setAfter(true)}>
                    {t("After turn")}
                  </button>
                </div>
                <p>
                  {t("Added tiles:")}{" "}
                  {frame.added.length
                    ? frame.added
                        .map((id) =>
                          tiles[id].joker
                            ? t("Joker")
                            : t(`${tiles[id].color} ${tiles[id].num}`),
                        )
                        .join(", ")
                    : t("Public table unchanged")}
                </p>
                <p>
                  {t(
                    "Only completed boards are recorded. Intermediate rearrangement steps and hidden racks are not shown.",
                  )}
                </p>
                {table.length === 0 ? (
                  <p>{t("The public table was empty.")}</p>
                ) : (
                  <div className="replay-melds">
                    {table.map((m, i) => {
                      const info = inspectMeld(m.tiles);
                      return (
                        <figure key={m.id}>
                          <figcaption>{t(`Group/run ${i + 1}`)}</figcaption>
                          <div className="tile-demo">
                            {info.ordered.map((id) => (
                              <Tile
                                key={id}
                                id={id}
                                glow={after && frame.added.includes(id)}
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
                )}
              </>
            )}
          </div>
          <div className="dialog-actions">
            <button
              className="secondary"
              disabled={!frame || index === 0}
              onClick={() => {
                setIndex((n) => n - 1);
                setAfter(true);
              }}
            >
              {t("Previous turn")}
            </button>
            <button
              className="secondary"
              disabled={!frame || index >= frames.length - 1}
              onClick={() => {
                setIndex((n) => n + 1);
                setAfter(true);
              }}
            >
              {t("Next turn")}
            </button>
            <button
              className="primary"
              ref={close}
              onClick={() => setFrames(null)}
            >
              {t("Done")}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
