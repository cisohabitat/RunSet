import { useEffect, useRef, useState } from "react";
import type { GameState } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import { explainMeld } from "../engine/coaching";
import { lastPlay } from "../lib/lastPlay";
import { useI18n } from "../i18n/I18n";
import { Tile } from "./Tile";
export function MoveReview({ game }: { game: GameState }) {
  const { t } = useI18n(),
    steps = lastPlay(game);
  const [open, setOpen] = useState(false),
    [index, setIndex] = useState(0);
  const ref = useRef<HTMLDialogElement>(null),
    close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open || !steps.length) return;
    const modal = ref.current,
      opener = document.activeElement as HTMLElement | null;
    modal?.showModal();
    close.current?.focus();
    return () => {
      modal?.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, steps.length]);
  if (!steps.length) return null;
  const step = steps[Math.min(index, steps.length - 1)],
    info = inspectMeld(step.tiles);
  return (
    <>
      <button
        className="text-button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
      >
        {t("Review latest play")}
      </button>
      {open && (
        <dialog
          ref={ref}
          className="hint-preview move-review"
          aria-labelledby="move-review-title"
          onCancel={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <h2 id="move-review-title">{t("Where the latest tiles landed")}</h2>
          <p>
            {t(
              "Review only. This shows new tiles in their final groups, not the order of earlier rearrangements. Timed games keep running.",
            )}
          </p>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t("Latest placements")}
            tabIndex={0}
          >
            {game.log.length > 0 && <p>{t(game.log.at(-1)!)}</p>}
            <p role="status">
              {t(
                `Tile ${Math.min(index + 1, steps.length)} of ${steps.length}`,
              )}
            </p>
            <section className="preview-meld">
              <h3>{t(`Destination: group or run ${step.index + 1}`)}</h3>
              <div className="tile-demo">
                {info.ordered.map((id) => (
                  <Tile
                    key={id}
                    id={id}
                    glow={id === step.id}
                    tabIndex={-1}
                    represents={
                      info.values[id]
                        ? `${info.jokerColors[id]} ${info.values[id]}`
                        : undefined
                    }
                  />
                ))}
              </div>
              <p>{t(explainMeld(step.tiles))}</p>
            </section>
            <p>
              {t(
                "Your current table and selected tiles stay unchanged when you close this review.",
              )}
            </p>
          </div>
          <div className="dialog-actions">
            <button
              className="secondary"
              disabled={index === 0}
              onClick={() => setIndex((n) => n - 1)}
            >
              {t("Previous tile")}
            </button>
            <button
              className="secondary"
              disabled={index >= steps.length - 1}
              onClick={() => setIndex((n) => n + 1)}
            >
              {t("Next tile")}
            </button>
            <button
              ref={close}
              className="primary"
              onClick={() => setOpen(false)}
            >
              {t("Close review")}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
