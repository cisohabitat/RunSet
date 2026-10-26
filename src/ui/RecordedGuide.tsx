import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18n";
export function RecordedGuide({
  src,
  reminder,
  text,
}: {
  src: string;
  reminder: boolean;
  text: string;
}) {
  const { t } = useI18n();
  const audio = useRef<HTMLAudioElement | null>(null);
  const group = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [speaking, setSpeaking] = useState(false);
  const [played, setPlayed] = useState(false);
  const [error, setError] = useState(false);
  const cancel = () => {
    const current = audio.current;
    audio.current = null;
    if (current) {
      current.onended = null;
      current.onerror = null;
      current.pause();
      current.removeAttribute("src");
      current.load();
    }
  };
  const stop = () => {
    cancel();
    setSpeaking(false);
  };
  useEffect(() => {
    const leave = () => {
      cancel();
      setSpeaking(false);
    };
    const hidden = () => {
      if (document.hidden) leave();
    };
    const details = group.current?.closest("details");
    const close = () => {
      if (!details?.open) leave();
    };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", leave);
    details?.addEventListener("toggle", close);
    return () => {
      cancel();
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leave);
      details?.removeEventListener("toggle", close);
    };
  }, [src]);
  const listen = () => {
    stop();
    setError(false);
    try {
      const current = new Audio(src);
      audio.current = current;
      const fail = () => {
        if (audio.current !== current) return;
        stop();
        setError(true);
      };
      current.onended = () => {
        if (audio.current !== current) return;
        stop();
      };
      current.onerror = fail;
      setSpeaking(true);
      setPlayed(true);
      void current.play().catch(fail);
    } catch {
      stop();
      setError(true);
    }
  };
  return (
    <div
      className="read-aloud"
      ref={group}
      role="group"
      aria-label={t("Read aloud")}
    >
      <div className="read-aloud-actions">
        <button ref={button} className="text-button" onClick={listen}>
          {t(
            played
              ? "Replay audio"
              : reminder
                ? "Listen to reminder"
                : "Listen",
          )}
        </button>
        {speaking && (
          <button
            className="text-button"
            onClick={() => {
              stop();
              button.current?.focus({ preventScroll: true });
            }}
          >
            {t("Stop audio")}
          </button>
        )}
      </div>
      {reminder && <p className="audio-transcript">{text}</p>}
      <span className="audio-note" role="status">
        {t(
          error
            ? "Audio could not play. Choose Device voice or read the instructions."
            : speaking
              ? "Reading aloud…"
              : "Optional recorded guide. Available offline when Ready offline is shown.",
        )}
      </span>
    </div>
  );
}
