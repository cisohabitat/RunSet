import "./ResumeGuide.css";
import { useEffect, useState } from "react";
import type { GameState } from "../engine/game";
import { useI18n } from "../i18n/I18n";
import { turnGuidance } from "../lib/guidance";

/** Read-only summary: no save loading, timer resets, planners or hidden tiles. */
export default function ResumeGuide({ game }: { game: GameState }) {
  const { t } = useI18n();
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    if (!game.turnSeconds || game.deadline === undefined) return;
    const update = () => setClock(Date.now());
    update();
    const timer = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, [game.turnSeconds, game.deadline]);
  const expired =
    !!game.turnSeconds && game.deadline !== undefined && clock >= game.deadline;
  const dirty =
    JSON.stringify(game.table) !== JSON.stringify(game.turnStart.table);
  const next = expired
    ? game.pool.length
      ? "Time has run out for this turn. Continuing resets unfinished edits, draws one tile and ends this turn."
      : "Time has run out for this turn. Continuing resets unfinished edits and passes without drawing a tile."
    : turnGuidance(game, [], []).compactMessage;
  return (
    <div className="resume-context">
      <p>
        <strong>{t("Next when you continue")}</strong>
        <br />
        {t(next)}
      </p>
      {!expired && dirty && !game.players[game.current].bot && (
        <p>
          {t("Unfinished moves kept. Check the table before ending your turn.")}{" "}
          {t(
            game.history?.length
              ? "After continuing, Undo takes back one move. Reset restores this turn without a penalty."
              : "After continuing, Reset restores this turn without a penalty.",
          )}
        </p>
      )}
      {!expired && (
        <p>
          {t(
            game.turnSeconds
              ? "Timed game: the original deadline still applies. If it has passed, continuing processes the expired turn."
              : "No timer. Resume whenever you like.",
          )}
        </p>
      )}
    </div>
  );
}
