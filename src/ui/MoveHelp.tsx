import { useEffect, useRef, useState } from "react";
import type { GameState } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import type { MoveHelpData } from "../lib/moveHelp";
import { useI18n } from "../i18n/I18n";
import { Tile } from "./Tile";
import { useTouchClick } from "./useTouchClick";
export function MoveHelp({
  game,
  data,
  disabled,
}: {
  game: GameState;
  data: MoveHelpData | null;
  disabled: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    close = useRef<HTMLButtonElement>(null);
  const touch = useTouchClick(() => setOpen(true));
  useEffect(() => setOpen(false), [data]);
  useEffect(() => {
    if (!open || !data) return;
    const modal = dialog.current,
      target = opener.current;
    modal?.showModal();
    close.current?.focus();
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
  }, [open, data]);
  return (
    <>
      <button
        ref={opener}
        className="text-button move-help-button"
        disabled={disabled || !data}
        {...touch}
      >
        {t("Why this move?")}
      </button>
      {open && data && (
        <dialog
          ref={dialog}
          className="hint-preview meld-inspector move-help"
          aria-labelledby="move-help-title"
          onCancel={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <h2 id="move-help-title">{t("Move help")}</h2>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t("Move explanation")}
            tabIndex={0}
          >
            <p>
              {t(
                data.kind === "blocked" ? "Last blocked move" : "Current draft",
              )}
            </p>
            <p>{t(data.reason)}</p>
            {data.ids.length > 0 && (
              <section aria-label={t("Tiles in this move")}>
                <div className="tile-demo">
                  {data.ids.map((id) => {
                    const owner = game.table.find((m) => m.tiles.includes(id)),
                      info = owner ? inspectMeld(owner.tiles) : null;
                    return (
                      <Tile
                        key={id}
                        id={id}
                        represents={
                          info?.valid && info.values[id]
                            ? `${info.jokerColors[id]} ${info.values[id]}`
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              </section>
            )}
            <h3>{t("Try this next")}</h3>
            <p>{t(data.next)}</p>
            {data.candidate !== undefined && (
              <section aria-label={t("One tile you can add")}>
                <div className="tile-demo">
                  <Tile id={data.candidate} />
                </div>
              </section>
            )}
            <p>
              {t(
                "Preview only. Your tiles and turn are unchanged. Timed games keep running.",
              )}
            </p>
          </div>
          <div className="dialog-actions">
            <button
              ref={close}
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
