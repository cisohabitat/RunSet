import { useEffect, useRef } from "react";
import { useI18n } from "../i18n/I18n";
export default function Settings({
  reading,
  setReading,
  contrast,
  setContrast,
  touch,
  setTouch,
  muted,
  setMuted,
  learning,
  setLearning,
  narrate,
  setNarrate,
  pace,
  setPace,
  timed,
  onClose,
}: {
  reading: boolean;
  setReading: (value: boolean) => void;
  contrast: boolean;
  setContrast: (value: boolean) => void;
  touch: boolean;
  setTouch: (value: boolean) => void;
  muted: boolean;
  setMuted: (value: boolean) => void;
  learning: boolean;
  setLearning: (value: boolean) => void;
  narrate: boolean;
  setNarrate: (value: boolean) => void;
  pace: number;
  setPace: (value: number) => void;
  timed: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    opener.current ??= document.activeElement as HTMLElement | null;
    const modal = dialog.current;
    modal?.showModal();
    close.current?.focus();
    return () => {
      modal?.close();
      if (opener.current?.isConnected) opener.current.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="confirm-dialog settings-dialog"
      aria-labelledby="settings-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="settings-heading">
        <h2 id="settings-title">{t("Settings")}</h2>
        <button ref={close} className="secondary" onClick={onClose}>
          {t("Done")}
        </button>
      </div>
      <fieldset>
        <legend>{t("Reading and display")}</legend>
        <label>
          <input
            type="checkbox"
            checked={reading}
            onChange={(e) => setReading(e.target.checked)}
          />
          {t("Comfortable reading")}
        </label>
        <p>
          {t(
            "Larger text, tiles and buttons. Pages scroll so you can read and play at your own pace.",
          )}
        </p>
        <label>
          <input
            type="checkbox"
            checked={contrast}
            onChange={(e) => setContrast(e.target.checked)}
          />
          {t("Higher contrast")}
        </label>
        <p>
          {t(
            "Stronger text, tile colours and borders. Tile sizes and your game stay the same.",
          )}
        </p>
        {!reading && (
          <label>
            <input
              type="checkbox"
              checked={touch}
              onChange={(e) => setTouch(e.target.checked)}
            />
            {t("Larger touch controls")}
          </label>
        )}
        <p className="settings-preview">
          {t("Choose tiles, then choose where to place them.")}
        </p>
      </fieldset>
      <fieldset>
        <legend>{t("Sound and pace")}</legend>
        <label>
          <input
            type="checkbox"
            checked={!muted}
            onChange={(e) => setMuted(!e.target.checked)}
          />
          {t("Sound effects")}
        </label>
        <label className="pace-setting">
          {t("Opponent pace")}
          <select
            aria-label={t("Opponent pace")}
            value={pace}
            onChange={(e) => setPace(Number(e.target.value))}
          >
            <option value={700}>{t("Quick")}</option>
            <option value={1400}>{t("Comfortable")}</option>
            <option value={2400}>{t("Take my time")}</option>
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>{t("Learning help")}</legend>
        <label>
          <input
            type="checkbox"
            checked={learning}
            onChange={(e) => setLearning(e.target.checked)}
          />
          {t("Explain penalties before ending a turn")}
        </label>
        <label>
          <input
            type="checkbox"
            checked={narrate}
            onChange={(e) => setNarrate(e.target.checked)}
          />
          {t("Explain opponent moves")}
        </label>
      </fieldset>
      <p>
        {t(
          "Settings are remembered on this device. Your game and lesson progress are kept.",
        )}
      </p>
      {timed && (
        <p role="status">
          {t("The turn timer keeps running while settings are open.")}
        </p>
      )}
      <button className="primary" onClick={onClose}>
        {t("Done")}
      </button>
    </dialog>
  );
}
