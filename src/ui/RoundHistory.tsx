import { useEffect, useRef, useState } from "react";
import { clearRoundHistory, readRoundHistory } from "../lib/roundHistory";
import { roundHistoryView, type HistoryLevel } from "../lib/roundHistoryView";
import { useI18n } from "../i18n/I18n";
import "./RoundHistory.css";
export default function RoundHistory() {
  const { t, locale } = useI18n(),
    [history, setHistory] = useState<ReturnType<
      typeof readRoundHistory
    > | null>(null),
    [level, setLevel] = useState<HistoryLevel>("all"),
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
    view = roundHistoryView(rounds ?? [], level);
  return (
    <>
      <button
        className="text-button"
        ref={opener}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setHistory(readRoundHistory());
          setLevel("all");
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
                "Latest 30 finishes recorded here. Completed imports and older finishes are not added. History is excluded from backups and portable profiles.",
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
                  {t("Recorded rounds")}: <strong>{view.total}</strong>
                </p>
                <label className="history-filter">
                  {t("Opponent difficulty")}
                  <select
                    aria-label={t("Opponent difficulty")}
                    value={level}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (["all", "easy", "normal", "hard"].includes(next))
                        setLevel(next as HistoryLevel);
                    }}
                  >
                    <option value="all">{t("All difficulties")}</option>
                    <option value="easy">{t("easy")}</option>
                    <option value="normal">{t("normal")}</option>
                    <option value="hard">{t("hard")}</option>
                  </select>
                </label>
                <p>
                  {t(
                    "A round matches if any computer used this level. Counts below describe the shown records.",
                  )}
                </p>
                <p role="status" className="history-counts">
                  {t("Shown rounds")}: <strong>{view.rounds.length}</strong> ·{" "}
                  {t("Player wins")}: <strong>{view.wins}</strong>
                </p>
                {rounds && rounds.length > 0 && view.rounds.length === 0 && (
                  <p>{t("No rounds match this difficulty.")}</p>
                )}
                {!rounds?.length && (
                  <p>
                    {t(
                      "No rounds recorded yet. Finish a round to add it here.",
                    )}
                  </p>
                )}
                <ol className="round-records">
                  {view.rounds.map((r) => (
                    <li key={r.id}>
                      <details>
                        <summary>
                          <span>
                            <time dateTime={new Date(r.at).toISOString()}>
                              {new Intl.DateTimeFormat(locale, {
                                dateStyle: "short",
                                timeStyle: "short",
                              }).format(r.at)}
                            </time>{" "}
                            · {t("Round")} {r.round}
                          </span>
                          <span>
                            {t("Winner")}:{" "}
                            <strong>{r.players[r.winner].name}</strong>
                          </span>
                        </summary>
                        <ul aria-label={t("Round scores")}>
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
                      </details>
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
                      setLevel("all");
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
              aria-label={t("Clear recorded rounds")}
              disabled={busy || confirm}
              onClick={() => setConfirm(true)}
            >
              {t("Clear records")}
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
