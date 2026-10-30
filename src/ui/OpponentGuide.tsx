import type { GameState } from "../engine/game";
import { useI18n } from "../i18n/I18n";
import "./OpponentGuide.css";
export function OpponentGuide({ game }: { game: GameState }) {
  const { t } = useI18n();
  return (
    <details className="opponent-guide">
      <summary>{t("Opponent styles and fair play")}</summary>
      <ul>
        {game.players
          .filter((p) => p.bot)
          .map((p, i) => (
            <li key={i}>
              <strong>{p.name}</strong> · {t(p.bot!)}
              <p>
                {t(
                  p.bot === "easy"
                    ? "After opening, Easy makes new groups and runs. It leaves existing table melds alone."
                    : p.bot === "normal"
                      ? "After opening, Normal also adds tiles to existing groups and runs. It leaves their structure intact."
                      : "After opening, Hard also searches for ways to split and rebuild table melds. It may find the same move as Normal.",
                )}
              </p>
            </li>
          ))}
      </ul>
      {game.players.some(p => p.bot === "easy") && (
        <p>{t("Easy may draw repeatedly while waiting for a new group or run. After opening, Normal can also add single tiles to the table.")}</p>
      )}
      <p>
        {t(
          "Before opening, every opponent needs at least 30 points using only its own rack.",
        )}
      </p>
      <p>
        {t(
          "All opponents follow the same rules and cannot see your rack. Hints can help with table rearrangements on every difficulty.",
        )}
      </p>
      <p>
        {t(
          "An opponent drawing does not prove that no legal move exists. Its search may not find every move.",
        )}
      </p>
      <p>
        {t(
          "Opponent pace changes waiting time, not tile choices. Change the playing style when starting a fresh game.",
        )}
      </p>
    </details>
  );
}
