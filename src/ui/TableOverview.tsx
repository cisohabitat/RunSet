import { useEffect, useRef, useState } from "react";
import type { GameState } from "../engine/game";
import { meldOverview } from "../lib/meldOverview";
import { useI18n } from "../i18n/I18n";
import { useTouchClick } from "./useTouchClick";
import "./TableOverview.css";
export function TableOverview({
  game,
  disabled,
  onFind,
}: {
  game: GameState;
  disabled: boolean;
  onFind: (id: number) => void;
}) {
  const { t } = useI18n(),
    [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    done = useRef<HTMLButtonElement>(null),
    pending = useRef<number | null>(null);
  const touch = useTouchClick(() => setOpen(true));
  useEffect(() => setOpen(false), [game]);
  useEffect(() => {
    if (!open && pending.current !== null) {
      const id = pending.current;
      pending.current = null;
      onFind(id);
    }
  }, [open, onFind]);
  useEffect(() => {
    if (!open) return;
    const modal = dialog.current,
      target = opener.current;
    modal?.showModal();
    done.current?.focus();
    return () => {
      modal?.close();
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
  return (
    <>
      <button
        ref={opener}
        className="text-button table-overview-button"
        disabled={disabled || !game.table.length}
        aria-haspopup="dialog"
        aria-expanded={open}
        {...touch}
      >
        {t("Table overview")}
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="hint-preview table-overview"
          aria-labelledby="table-overview-title"
          onCancel={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <h2 id="table-overview-title">{t("Table overview")}</h2>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t("Groups and runs on the table")}
            tabIndex={0}
          >
            <p>
              {t(
                "Choose a group or run to find its first tile. Your selection stays the same.",
              )}
            </p>
            <ol>
              {game.table.map((meld, i) => {
                const info = meldOverview(meld.tiles);
                return (
                  <li key={meld.id}>
                    <button
                      disabled={info.first === undefined}
                      onClick={() => {
                        if (info.first === undefined) return;
                        pending.current = info.first;
                        setOpen(false);
                      }}
                    >
                      <strong>{t(`Find group/run ${i + 1}`)}</strong>
                      <span>
                        {info.valid ? (
                          <>
                            {t(info.kind!)} ·{" "}
                            {info.colour && <>{t(info.colour)} </>}
                            {info.numbers} · {t(`${info.points} pts`)}
                          </>
                        ) : (
                          t("Needs fixing")
                        )}
                        {" · "}
                        {t(`${info.count} tile${info.count === 1 ? "" : "s"}`)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p>
              {t(
                "This overview does not move tiles. Timed games keep running.",
              )}
            </p>
          </div>
          <div className="dialog-actions">
            <button
              ref={done}
              className="primary"
              onClick={() => setOpen(false)}
            >
              {t("Back to table")}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
