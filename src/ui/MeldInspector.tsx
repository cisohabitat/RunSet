import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18n";
import { type Meld, inspectMeld } from "../engine/meld";
import { explainMeld } from "../engine/coaching";
import { Tile } from "./Tile";
import "./MeldInspector.css";
export function MeldInspector({
  ids,
  index = 0,
  disabled,
  selection = false,
  source,
}: {
  ids: number[];
  index?: number;
  disabled: boolean;
  selection?: boolean;
  source?: Meld[];
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
  const info = open && !selection ? inspectMeld(ids) : null,
    title = selection ? "selection-inspector" : `meld-inspector-${index}`,
    countLabel = t(
      ids.length
        ? `${ids.length} tile${ids.length === 1 ? "" : "s"}`
        : "Select tiles",
    );
  return (
    <>
      <button
        ref={opener}
        className={
          selection
            ? "text-button selection-count inspect-selection"
            : "text-button inspect-meld"
        }
        aria-label={
          selection
            ? `${t("Preview selected tiles")} · ${countLabel}`
            : `${t("Zoom")} · ${index + 1}`
        }
        aria-haspopup="dialog"
        aria-live={selection ? "polite" : undefined}
        aria-atomic={selection || undefined}
        aria-expanded={open}
        title={t(selection ? "Preview selected tiles" : "Look closer")}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {selection ? countLabel : t("Zoom")}
      </button>
      {open && (
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
            {selection
              ? t("Selected tiles")
              : `${t("Look closer")} · ${index + 1}`}
          </h2>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t(selection ? "Selected tiles" : "Table melds")}
            tabIndex={0}
          >
            <div className="tile-demo">
              {(info?.ordered ?? ids).map((id) => {
                const owner = source?.find((m) => m.tiles.includes(id));
                const detail =
                  info ?? (owner ? inspectMeld(owner.tiles) : undefined);
                return (
                  <Tile
                    key={id}
                    id={id}
                    tabIndex={-1}
                    represents={
                      detail?.values[id]
                        ? `${detail.jokerColors[id]} ${detail.values[id]}`
                        : undefined
                    }
                  />
                );
              })}
            </div>
            <p>
              {t(
                selection
                  ? "These are your selected tiles. Close this view, then choose where to place them."
                  : explainMeld(ids),
              )}
            </p>
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
