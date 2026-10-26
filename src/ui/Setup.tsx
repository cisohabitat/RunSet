import { useI18n } from "../i18n/I18n";
import type { GameSettings } from "../lib/gameSettings";
import { useState } from "react";
import type { Difficulty, GameOptions } from "../engine/game";
export function Setup({
  onStart,
  onBack,
  hasSave,
  initial,
}: {
  onStart: (
    name: string,
    bots: number,
    difficulty: Difficulty,
    options?: GameOptions,
  ) => void;
  onBack: () => void;
  hasSave: boolean;
  initial?: GameSettings;
}) {
  const { t, locale } = useI18n();
  const [coach, setCoach] = useState(initial?.coach ?? true);
  const [target, setTarget] = useState<0 | 100 | 200 | 500>(
      initial?.target ?? 0,
    ),
    [turnSeconds, setTurnSeconds] = useState<0 | 60 | 120>(
      initial?.turnSeconds ?? 0,
    );
  const [name, setName] = useState(
      initial?.name ?? (locale === "zh-CN" ? "你" : "You"),
    ),
    [bots, setBots] = useState(initial?.bots ?? 2),
    [difficulty, setDifficulty] = useState<Difficulty>(
      initial?.difficulty ?? "normal",
    );
  return (
    <main className="page setup">
      <button className="text-button" onClick={onBack}>
        {t("← Back")}
      </button>
      <div className="eyebrow">{t("PULL UP A CHAIR")}</div>
      <h1>
        {t("Your table.")}
        <br />
        <em>{t("Your pace.")}</em>
      </h1>
      <p>{t("Settle in for a round or a longer match of tile-rummy.")}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart(name, bots, difficulty, { target, turnSeconds, coach });
        }}
      >
        <label className="field-label" htmlFor="name">
          {t("What should we call you?")}
        </label>
        <input
          id="name"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
        />
        <fieldset>
          <legend>{t("Computer opponents")}</legend>
          <div className="choices">
            {[1, 2, 3].map((n) => (
              <button
                type="button"
                className={bots === n ? "choice active" : "choice"}
                aria-pressed={bots === n}
                key={n}
                onClick={() => setBots(n)}
              >
                {n} {t(n === 1 ? "opponent" : "opponents")}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t("A little challenge?")}</legend>
          <div className="difficulty-choices">
            {(["easy", "normal", "hard"] as const).map((d, i) => (
              <button
                type="button"
                className={difficulty === d ? "choice active" : "choice"}
                aria-pressed={difficulty === d}
                key={d}
                onClick={() => setDifficulty(d)}
              >
                <strong>
                  {t(["Easy does it", "A fair match", "Think ahead"][i])}
                </strong>
                <span>
                  {t(
                    [
                      "New melds only. Room to learn.",
                      "Clever sets and well-timed additions.",
                      "Rearranges the table. Bring your best.",
                    ][i],
                  )}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t("How long would you like to play?")}</legend>
          <label className="field-label" htmlFor="match-length">
            {t("Game length")}
          </label>
          <select
            id="match-length"
            value={target}
            onChange={(e) =>
              setTarget(Number(e.target.value) as 0 | 100 | 200 | 500)
            }
          >
            <option value={0}>{t("One round")}</option>
            <option value={100}>{t("Match · first to 100 points")}</option>
            <option value={200}>{t("Match · first to 200 points")}</option>
            <option value={500}>{t("Match · first to 500 points")}</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>{t("Optional turn timer")}</legend>
          <label className="field-label" htmlFor="turn-timer">
            {t("Time per turn")}
          </label>
          <select
            id="turn-timer"
            value={turnSeconds}
            onChange={(e) =>
              setTurnSeconds(Number(e.target.value) as 0 | 60 | 120)
            }
          >
            <option value={0}>
              {t("No timer · recommended for learning")}
            </option>
            <option value={60}>{t("1 minute")}</option>
            <option value={120}>{t("2 minutes")}</option>
          </select>
          {turnSeconds > 0 && (
            <p className="muted">
              {t(
                "When time runs out, unfinished edits are restored and you draw one tile (or pass if the pool is empty). The clock keeps running when you leave the game.",
              )}
            </p>
          )}
        </fieldset>
        <label className="setup-coach">
          <input
            type="checkbox"
            checked={coach}
            onChange={(e) => setCoach(e.target.checked)}
          />
          {t("Show first-game guidance")}
        </label>
        {hasSave && (
          <p className="muted">
            {t("Starting a new game replaces your saved round.")}
          </p>
        )}
        <button className="primary" type="submit">
          {t("Deal the tiles ")}
          <span>→</span>
        </button>
      </form>
    </main>
  );
}
