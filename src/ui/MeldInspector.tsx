import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18n";
import { inspectMeld } from "../engine/meld";
import { explainMeld } from "../engine/coaching";
import { Tile } from "./Tile";
import "./MeldInspector.css";
export function MeldInspector({
  ids,
  index,
  disabled,
}: {
  ids: number[];
  index: number;
  disabled: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
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
  }, [open]);
  const info = open ? inspectMeld(ids) : null,
    title = `meld-inspector-${index}`;
  return (
    <>
      <button
        ref={opener}
        className="text-button inspect-meld"
        aria-label={`${t("Zoom")} · ${index + 1}`}
        title={t("Look closer")}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {t("Zoom")}
      </button>
      {open && info && (
        <dialog
          ref={dialog}
          className="hint-preview meld-inspector"
          aria-labelledby={title}
          onCancel={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <h2 id={title}>
            {t("Look closer")} · {index + 1}
          </h2>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t("Table melds")}
            tabIndex={0}
          >
            <div className="tile-demo">
              {info.ordered.map((id) => (
                <Tile
                  key={id}
                  id={id}
                  tabIndex={-1}
                  represents={
                    info.values[id]
                      ? `${info.jokerColors[id]} ${info.values[id]}`
                      : undefined
                  }
                />
              ))}
            </div>
            <p>{t(explainMeld(ids))}</p>
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
