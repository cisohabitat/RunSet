import { useEffect, useMemo, useRef } from "react";
import { reducer, turnCheck, type GameState } from "../engine/game";
import type { Hint } from "../engine/coaching";
import { inspectMeld } from "../engine/meld";
import { useI18n } from "../i18n/I18n";
import { Tile } from "./Tile";

export function HintPreview({
  game,
  hint,
  onClose,
  onPlace,
}: {
  game: GameState;
  hint: Hint;
  onClose: () => void;
  onPlace: () => void;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null),
    back = useRef<HTMLButtonElement>(null);
  const trial = useMemo(() => {
    if (!hint.table) return null;
    const base = { ...game, history: [] };
    const next = reducer(base, { type: "applyPlan", table: hint.table });
    return next !== base && turnCheck(next).valid ? next : null;
  }, [game, hint]);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null,
      modal = dialog.current;
    modal?.showModal();
    back.current?.focus();
    return () => {
      modal?.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  const rack = new Set(game.players[game.current].rack);
  return (
    <dialog
      ref={dialog}
      className="hint-preview"
      aria-labelledby="hint-preview-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <h2 id="hint-preview-title">{t("Preview this move")}</h2>
      <p>
        {t(
          "Preview only. Your tiles and turn are unchanged. Timed games keep running.",
        )}
      </p>
      <div
        className="hint-preview-body"
        role="region"
        aria-label={t("Proposed table")}
        tabIndex={0}
      >
        {trial ? (
          <>
            <p>
              {t(
                "Outlined tiles come from your rack. Each labelled row is a destination on the proposed table.",
              )}
            </p>
            {trial.table.map((meld, i) => {
              const original = game.table.find((m) => m.id === meld.id),
                info = inspectMeld(meld.tiles);
              return (
                <section
                  className="preview-meld"
                  key={meld.id}
                  aria-label={`${t("Group or run")} ${i + 1}`}
                >
                  <h3>
                    {t("Group or run")} {i + 1} ·{" "}
                    {t(
                      !original
                        ? "New"
                        : JSON.stringify(original.tiles) ===
                            JSON.stringify(meld.tiles)
                          ? "Unchanged"
                          : "Updated",
                    )}
                  </h3>
                  <div className="tile-demo">
                    {info.ordered.map((id) => (
                      <Tile
                        key={id}
                        id={id}
                        tabIndex={-1}
                        glow={rack.has(id)}
                        represents={
                          info.values[id]
                            ? `${info.jokerColors[id]} ${info.values[id]}`
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            <h3>{t("Why this works")}</h3>
            <ul>
              {hint.explanations?.map((reason, i) => (
                <li key={i}>{t(reason)}</li>
              ))}
            </ul>
            <p>
              {t(
                "Place hint copies this preview to your table. You can Undo it; choose End turn yourself when ready.",
              )}
            </p>
          </>
        ) : (
          <p role="status">
            {t(
              "This hint no longer fits the current table. Close the preview and request another hint.",
            )}
          </p>
        )}
      </div>
      <div className="dialog-actions">
        <button ref={back} className="secondary" onClick={onClose}>
          {t("Back to table")}
        </button>
        <button className="primary" disabled={!trial} onClick={onPlace}>
          {t("Place hint")}
        </button>
      </div>
    </dialog>
  );
}
