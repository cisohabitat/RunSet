import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18n";
import { Tile } from "./Tile";
export function RackOrganizer({
  ids,
  disabled,
  onKeep,
}: {
  ids: number[];
  disabled: boolean;
  onKeep: (ids: number[]) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<number[] | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    close = useRef<HTMLButtonElement>(null);
  const open = draft !== null;
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
  // The caller keys the panel by physical rack membership; expiry/new tiles discard a stale draft.
  const at = draft?.indexOf(chosen ?? -1) ?? -1;
  const shift = (direction: number) =>
    setDraft((current) => {
      if (!current || at < 0) return current;
      const next = [...current],
        target = at + direction;
      if (target < 0 || target >= next.length) return current;
      [next[at], next[target]] = [next[target], next[at]];
      return next;
    });
  return (
    <>
      <button
        ref={opener}
        className="text-button"
        disabled={disabled}
        onClick={() => {
          setDraft([...ids]);
          setChosen(null);
        }}
      >
        {t("Arrange rack")}
      </button>
      {draft && (
        <dialog
          ref={dialog}
          className="hint-preview meld-inspector rack-organizer"
          aria-labelledby="rack-order-title"
          onCancel={(e) => {
            e.preventDefault();
            setDraft(null);
          }}
        >
          <div className="settings-heading">
            <h2 id="rack-order-title">{t("Arrange rack")}</h2>
            <button
              ref={close}
              className="secondary"
              onClick={() => setDraft(null)}
            >
              {t("Cancel")}
            </button>
          </div>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t("Rack order preview")}
            tabIndex={0}
          >
            <p>
              {t(
                "Choose one tile, then move it left or right. This changes your rack display only.",
              )}
            </p>
            <div
              className="tile-demo"
              role="group"
              aria-label={t("Rack order preview")}
            >
              {draft.map((id) => (
                <Tile
                  key={id}
                  id={id}
                  selected={chosen === id}
                  onSelect={setChosen}
                />
              ))}
            </div>
          </div>
          <div className="dialog-actions">
            <button
              className="secondary"
              disabled={at <= 0}
              onClick={() => shift(-1)}
            >
              {t("Move left")}
            </button>
            <button
              className="secondary"
              disabled={at < 0 || at === draft.length - 1}
              onClick={() => shift(1)}
            >
              {t("Move right")}
            </button>
            <button
              className="primary"
              onClick={() => {
                onKeep(draft);
                setDraft(null);
              }}
            >
              {t("Keep order")}
            </button>
          </div>
          <p className="placement-announcement" role="status">
            {at >= 0 ? t(`Tile position ${at + 1} of ${draft.length}.`) : ""}
          </p>
        </dialog>
      )}
    </>
  );
}
