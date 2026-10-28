import "./ResumeGuide.css";
import type { GameState } from "../engine/game";
import { useI18n } from "../i18n/I18n";
import { turnGuidance } from "../lib/guidance";

/** Read-only summary: no save loading, timer resets, planners or hidden tiles. */
export default function ResumeGuide({ game }: { game: GameState }) {
  const { t } = useI18n();
  const dirty =
    JSON.stringify(game.table) !== JSON.stringify(game.turnStart.table);
  return (
    <div className="resume-context">
      <p>
        <strong>{t("Next when you continue")}</strong>
        <br />
        {t(turnGuidance(game, [], []).compactMessage)}
      </p>
      {dirty && !game.players[game.current].bot && (
        <p>
          {t("Unfinished moves kept. Check the table before ending your turn.")}
        </p>
      )}
      <p>
        {t(
          game.turnSeconds
            ? "Timed game: the original deadline still applies. If it has passed, continuing processes the expired turn."
            : "No timer. Resume whenever you like.",
        )}
      </p>
    </div>
  );
}
