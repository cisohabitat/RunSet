import { useI18n } from "../i18n/I18n";
import { type GameState, results, matchWinner } from "../engine/game";
import { TileDemo } from "./Tile";
export function GameOver({
  game,
  onNew,
  onHome,
  onNextRound,
}: {
  game: GameState;
  onNew: () => void;
  onHome: () => void;
  onNextRound: () => void;
}) {
  const { t } = useI18n();
  const scores = results(game),
    winner = scores.find((p) => p.winner)!;
  const champion = matchWinner(game);
  return (
    <main className={`page game-over ${!winner.bot ? "celebrate" : ""}`}>
      {!winner.bot && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      )}
      <span className="victory-mark">✳</span>
      <div className="eyebrow">
        {t(game.match ? `ROUND ${game.match.round} COMPLETE` : "THAT’S A WRAP")}
      </div>
      <h1>
        {t(!winner.bot ? "Beautifully played." : `${winner.name} takes it.`)}
      </h1>
      <p>
        {t(
          !winner.bot
            ? "The table was full of possibilities. You found yours."
            : "A good game always leaves room for another.",
        )}
      </p>
      {game.match && (
        <section className="match-scores" aria-label={t("Match scoreboard")}>
          <h2>
            {t(
              champion === null
                ? `First to ${game.match.target}`
                : `${game.players[champion].name} wins the match!`,
            )}
          </h2>
          {game.players.map((p, i) => (
            <p key={i}>
              {p.name}: <strong>{game.match!.totals[i]}</strong>
              {t(" total points")}
            </p>
          ))}
          <details>
            <summary>{t("Round scores")}</summary>
            {game.match.rounds.map((round, i) => (
              <p key={i}>
                {t(`Round ${i + 1}: `)}
                {round.scores
                  .map(
                    (score, j) =>
                      `${game.players[j].name} ${score > 0 ? "+" : ""}${score}`,
                  )
                  .join(" · ")}
              </p>
            ))}
          </details>
        </section>
      )}
      <div className="scoreboard">
        {[...scores]
          .sort((a, b) => Number(b.winner) - Number(a.winner))
          .map((p, i) => (
            <article className={p.winner ? "winner-card" : undefined} key={i}>
              <div>
                <h2>
                  {p.name}{" "}
                  {p.winner && (
                    <span className="winner-badge">{t("Winner")}</span>
                  )}
                </h2>
                <p>
                  {p.rack.length}
                  {t(" tiles remaining · rack value")}
                  {p.total}
                </p>
              </div>
              <strong>
                {t(p.score > 0 ? "+" : "")}
                {p.score}
              </strong>
              {p.rack.length > 0 && <TileDemo ids={p.rack} />}
            </article>
          ))}
      </div>
      <div className="hero-actions">
        {game.match && champion === null && (
          <button className="primary" onClick={onNextRound}>
            {t(`Deal round ${game.match.round + 1} →`)}
          </button>
        )}
        <button className="primary" onClick={onNew}>
          {t("Play again →")}
        </button>
        <button className="secondary" onClick={onHome}>
          {t("Home")}
        </button>
      </div>
    </main>
  );
}
