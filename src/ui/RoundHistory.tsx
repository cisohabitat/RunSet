import { useEffect, useRef, useState } from "react";
import { clearRoundHistory, readRoundHistory } from "../lib/roundHistory";
import { useI18n } from "../i18n/I18n";
import "./RoundHistory.css";
export default function RoundHistory() {
  const { t, locale } = useI18n(),
    [history, setHistory] = useState<ReturnType<
      typeof readRoundHistory
    > | null>(null),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  const modal = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    close = useRef<HTMLButtonElement>(null),
    clear = useRef<HTMLButtonElement>(null),
    accept = useRef<HTMLButtonElement>(null);
  const open = history !== null;
  useEffect(() => {
    if (!open) return;
    const dialog = modal.current,
      target = opener.current;
    dialog?.showModal();
    close.current?.focus();
    return () => {
      dialog?.close();
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
  useEffect(() => {
    if (open) (confirm ? accept : clear).current?.focus();
  }, [confirm]);
  const rounds = history?.rounds,
    wins = rounds?.filter((r) => !r.players[r.winner].bot).length ?? 0;
  return (
    <>
      <button
        className="text-button"
        ref={opener}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setHistory(readRoundHistory());
          setConfirm(false);
          setError(false);
        }}
      >
        {t("Round history")}
      </button>
      {open && (
        <dialog
          className="hint-preview round-history"
          ref={modal}
          aria-labelledby="round-history-title"
          onCancel={(e) => {
            e.preventDefault();
            if (!busy) setHistory(null);
          }}
        >
          <h2 id="round-history-title">{t("Round history")}</h2>
          <div
            className="hint-preview-body"
            role="region"
            aria-label={t("Recorded rounds")}
            tabIndex={0}
          >
            <p>
              {t(
                "Last 30 rounds completed on this device since this feature was added. Imported or previously completed games are not added. These records are not included in backups or portable profiles.",
              )}
            </p>
            {rounds === null ? (
              <p role="status">
                {t(
                  "These round records could not be read. Your saved game is kept. You can clear only these records below.",
                )}
              </p>
            ) : (
              <>
                <p>
                  {t("Recorded rounds")}: <strong>{rounds?.length ?? 0}</strong>{" "}
                  · {t("Player wins")}: <strong>{wins}</strong>
                </p>
                {!rounds?.length && (
                  <p>
                    {t(
                      "No rounds recorded yet. Finish a round to add it here.",
                    )}
                  </p>
                )}
                <ol className="round-records">
                  {rounds
                    ?.slice()
                    .reverse()
                    .map((r) => (
                      <li key={r.id}>
                        <p>
                          <time dateTime={new Date(r.at).toISOString()}>
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(r.at)}
                          </time>{" "}
                          · {t("Round")} {r.round}
                        </p>
                        <p>
                          {t("Winner")}:{" "}
                          <strong>{r.players[r.winner].name}</strong>
                        </p>
                        <ul>
                          {r.players.map((p, i) => (
                            <li key={i}>
                              <span>{p.name}</span> ·{" "}
                              {t(p.bot ? "Computer" : "Human player")}
                              {p.bot && <> · {t(p.bot)}</>} · {t("Round score")}
                              :{" "}
                              <strong>
                                {p.score > 0 ? "+" : ""}
                                {p.score}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                </ol>
              </>
            )}
            {history.writeFailed && (
              <p role="status">
                {t(
                  "A round record could not be saved. Your game and scores are kept.",
                )}
              </p>
            )}
            {error && (
              <p role="alert">
                {t("History could not be cleared. Your saved game is kept.")}
              </p>
            )}
            {confirm && (
              <section aria-label={t("Clear recorded rounds?")}>
                <h3>{t("Clear recorded rounds?")}</h3>
                <p>
                  {t(
                    "This removes only these round records. Your saved game, learning progress and settings are kept.",
                  )}
                </p>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    setConfirm(false);
                    clear.current?.focus();
                  }}
                >
                  {t("Keep history")}
                </button>
                <button
                  className="secondary danger-text"
                  ref={accept}
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    const ok = await clearRoundHistory();
                    setBusy(false);
                    setError(!ok);
                    if (ok) {
                      setHistory(readRoundHistory());
                      setConfirm(false);
                      clear.current?.focus();
                    }
                  }}
                >
                  {t("Clear history")}
                </button>
              </section>
            )}
          </div>
          <div className="dialog-actions">
            <button
              className="secondary"
              ref={clear}
              disabled={busy || confirm}
              onClick={() => setConfirm(true)}
            >
              {t("Clear recorded rounds")}
            </button>
            <button
              className="primary"
              ref={close}
              disabled={busy}
              onClick={() => setHistory(null)}
            >
              {t("Done")}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
