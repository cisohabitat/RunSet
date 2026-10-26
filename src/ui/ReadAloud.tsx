import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18n";
import { readingVoice, spokenText } from "../lib/speech";

/** A user gesture starts every utterance. Never enqueue automatic narration. */
export function ReadAloud({
  text,
  reminder = false,
}: {
  text: string;
  reminder?: boolean;
}) {
  const { locale, t } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const [played, setPlayed] = useState(false);
  const [notice, setNotice] = useState("");
  const current = useRef<SpeechSynthesisUtterance | null>(null);
  const group = useRef<HTMLDivElement>(null);
  const listenButton = useRef<HTMLButtonElement>(null);
  const supported =
    !!window.speechSynthesis && typeof SpeechSynthesisUtterance !== "undefined";
  const stop = () => {
    if (current.current) {
      current.current = null;
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };
  useEffect(() => {
    setSpeaking(false);
    setPlayed(false);
    setNotice("");
    const cancel = () => {
      if (current.current) {
        current.current = null;
        window.speechSynthesis.cancel();
      }
    };
    const hide = () => {
      if (document.hidden) {
        cancel();
        setSpeaking(false);
      }
    };
    const leave = () => {
      cancel();
      setSpeaking(false);
    };
    const details = group.current?.closest("details");
    const close = () => {
      if (!details?.open) leave();
    };
    // Calling getVoices also asks browsers with a delayed voice list to load it.
    try {
      if (supported) window.speechSynthesis.getVoices();
    } catch {
      // A device speech failure must leave the lesson playable.
    }
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", leave);
    details?.addEventListener("toggle", close);
    return () => {
      cancel();
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", leave);
      details?.removeEventListener("toggle", close);
    };
  }, [text, locale, supported]);
  const listen = () => {
    stop();
    if (!supported) return;
    try {
      const synthesis = window.speechSynthesis;
      const voices = synthesis.getVoices();
      const voice = readingVoice(voices, locale, !navigator.onLine);
      if (!voice) {
        setNotice(
          !voices.length
            ? "Voices are not ready. Try Listen again, or read the instructions."
            : !navigator.onLine && readingVoice(voices, locale, false)
              ? "This voice needs an internet connection. You can still read and play offline."
              : "No voice for this language is available. Add a Mandarin or English reading voice in your device settings, then try again.",
        );
        return;
      }
      const utterance = new SpeechSynthesisUtterance(spokenText(text));
      utterance.voice = voice;
      utterance.lang = voice.lang;
      // A light, welcoming delivery without rushing older learners.
      utterance.rate = 0.92;
      utterance.pitch = 1.06;
      current.current = utterance;
      utterance.onend = () => {
        if (current.current !== utterance) return;
        current.current = null;
        setSpeaking(false);
      };
      utterance.onerror = () => {
        if (current.current !== utterance) return;
        current.current = null;
        setSpeaking(false);
        setNotice(
          "Audio could not play. Try Listen again, or read the instructions.",
        );
      };
      setNotice("");
      setSpeaking(true);
      setPlayed(true);
      synthesis.cancel();
      synthesis.speak(utterance);
    } catch {
      stop();
      setNotice(
        "Audio could not play. Try Listen again, or read the instructions.",
      );
    }
  };
  return (
    <div
      ref={group}
      className="read-aloud"
      role="group"
      aria-label={t("Read aloud")}
    >
      {supported ? (
        <div className="read-aloud-actions">
          <button
            ref={listenButton}
            type="button"
            className="text-button"
            onClick={listen}
          >
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
              type="button"
              className="text-button"
              onClick={() => {
                stop();
                listenButton.current?.focus({ preventScroll: true });
              }}
            >
              {t("Stop audio")}
            </button>
          )}
        </div>
      ) : null}
      {reminder && <p className="audio-transcript">{text}</p>}
      <span className="audio-note" role="status">
        {t(
          !supported
            ? "Read aloud is unavailable in this browser. The instructions are still available as text."
            : notice ||
                (speaking
                  ? "Reading aloud…"
                  : "Optional device voice. Offline audio depends on installed voices."),
        )}
      </span>
    </div>
  );
}
