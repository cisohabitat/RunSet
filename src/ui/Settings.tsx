import { useEffect, useRef, useState } from "react";
import { LanguageSwitch, useI18n } from "../i18n/I18n";
export default function Settings({
  reading,
  simple,
  setSimple,
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
  simple: boolean;
  setSimple: (value: boolean) => void;
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
  const { t, error } = useI18n();
  const [guideOpen, setGuideOpen] = useState(false);
  const guide = useRef<HTMLDetailsElement>(null);
  const readingControl = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    // Safari touch clicks need not move focus to the button that opened a dialog.
    opener.current ??=
      document.querySelector<HTMLElement>(".site-header .sound-button") ??
      (document.activeElement as HTMLElement | null);
    const modal = dialog.current;
    modal?.showModal();
    close.current?.focus();
    return () => {
      modal?.close();
      const target = opener.current;
      if (target?.isConnected) {
        target.focus();
        // WebKit can release native-dialog inertness after effect cleanup.
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
      <details
        ref={guide}
        className="caregiver-guide"
        onToggle={(e) => setGuideOpen(e.currentTarget.open)}
      >
        <summary style={{ minHeight: 48, paddingBlock: 12, cursor: "pointer" }}>
          {t("Set up together")}
        </summary>
        {guideOpen && (
          <>
            <p>
              {t(
                "Take a moment together, then choose what feels comfortable. Each choice is optional.",
              )}
            </p>
            <LanguageSwitch />
            {error && (
              <p role="alert">
                中文暂时无法加载，请联网后重试。 Chinese could not load. Please
                retry.
              </p>
            )}
            <ol>
              <li>
                <p>{t("Choose English or 简体中文 above.")}</p>
              </li>
              <li>
                <p>
                  {t(
                    "Try Comfortable reading for larger text and tiles, and Higher contrast if colours are hard to see. Simple home screen keeps the main choices large.",
                  )}
                </p>
              </li>
              <li>
                <p>
                  {t(
                    "Choose Sound effects if wanted. In Learn to play, tap Listen to hear an instruction; you can always read it.",
                  )}
                </p>
              </li>
              <li>
                <p>
                  {t(
                    "Set Opponent pace to Unhurried for a five-second wait before planning. Timed turns still keep their limit.",
                  )}
                </p>
              </li>
              <li>
                <p>
                  {t(
                    "Try Learn to play together first. New games default to one Easy opponent, no timer and guidance on.",
                  )}
                </p>
              </li>
            </ol>
            <button
              className="secondary"
              style={{ minHeight: 48 }}
              onClick={() => {
                if (guide.current) guide.current.open = false;
                readingControl.current?.focus({ preventScroll: true });
                readingControl.current?.scrollIntoView({ block: "center" });
              }}
            >
              {t("Choose display settings")}
            </button>
            <p>{t("Use the controls below. Your current game is kept.")}</p>
          </>
        )}
      </details>
      <fieldset>
        <legend>{t("Reading and display")}</legend>
        <label>
          <input
            type="checkbox"
            checked={simple}
            onChange={(e) => setSimple(e.target.checked)}
          />
          {t("Simple home screen")}
        </label>
        <p>
          {t(
            "Large main choices. More options stay available when you need them.",
          )}
        </p>
        <label>
          <input
            type="checkbox"
            ref={readingControl}
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
            <option value={5000}>{t("Unhurried · 5 seconds")}</option>
          </select>
        </label>
        <p>
          {t(
            "Pace changes the wait before an opponent plays. Timed turns keep the same limit.",
          )}
        </p>
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
