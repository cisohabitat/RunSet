import { useI18n } from "../i18n/I18n";
import { type GameState, results, matchWinner } from "../engine/game";
import { roundSummary, learningTakeaway } from "../lib/roundSummary";
import { tiles } from "../engine/tiles";
import { MoveReview } from "./MoveReview";
import { TileDemo } from "./Tile";
export function GameOver({
  game,
  celebrate = false,
  onNew,
  onHome,
  onNextRound,
  onReplay,
  onPractice,
}: {
  game: GameState;
  celebrate?: boolean;
  onNew: () => void;
  onHome: () => void;
  onNextRound: () => void;
  onReplay: () => void;
  onPractice: () => void;
}) {
  const { t } = useI18n();
  const scores = results(game),
    winner = scores.find((p) => p.winner)!;
  const champion = matchWinner(game);
  const summary = roundSummary(game);
  const takeaway = learningTakeaway(game);
  const maxRack = Math.max(1, ...scores.map((p) => p.total));
  const signed = (value: number) => (value > 0 ? `+${value}` : String(value));
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`page game-over ${celebrate && !winner.bot ? "celebrate" : ""}`}
    >
      {celebrate && !winner.bot && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
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
      <section className="round-summary" aria-label={t("Why the round ended")}>
        <h2>{t("Why this round ended")}</h2>
        <p>{t(summary.message)}</p>
        <p>{t(summary.winnerExplanation)}</p>
        {summary.tieBreak && <p>{t(summary.tieBreak)}</p>}
      </section>
      <section className="scoring-guide" aria-label={t("How scoring works")}>
        <h2>{t("How the scores work")}</h2>
        <p>
          {t(
            "Each number tile counts as its number. Each joker left in a rack counts as 30 points.",
          )}
        </p>
        <p>
          {t(
            "Other players lose their remaining tile total. The winner gains those totals; their own remaining tiles are not deducted.",
          )}
        </p>
        <div
          className="score-transfer"
          role="group"
          aria-label={t("Scoring at a glance")}
        >
          <p>{t("Rack total → round score")}</p>
          <p>
            {t(
              "Bars compare remaining rack values. A shorter bar means fewer points left in that rack.",
            )}
          </p>
          <ul>
            {scores.map((player, i) => (
              <li key={i}>
                <span>{player.name}</span>
                <meter
                  min={0}
                  max={maxRack}
                  value={player.total}
                  aria-label={t(`${player.name}: remaining rack value`)}
                />
                <span>
                  {player.total} → <strong>{signed(player.score)}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="winner-calculation">
          {t("Winner’s round score:")}{" "}
          {scores
            .filter((player) => !player.winner)
            .map((player) => player.total)
            .join(" + ")}{" "}
          = {signed(winner.score)}
        </p>
      </section>
      <section
        className="round-summary learning-takeaway"
        aria-label={t("One thing to take with you")}
      >
        <h2>{t("One thing to take with you")}</h2>
        <p>{t(takeaway.message)}</p>
        {takeaway.ids.length > 0 && <TileDemo ids={takeaway.ids} />}
        <p>
          {t(
            "No need to rush. Choose Change settings for a gentler opponent, or play again when you feel ready.",
          )}
        </p>
      </section>
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
                  {t(
                    `${p.rack.length} tiles remaining · rack value ${p.total}`,
                  )}
                </p>
              </div>
              <div className="round-score">
                <span>{t("Round score")}</span>
                <strong>{signed(p.score)}</strong>
              </div>
              <p className="score-explanation">
                {t(
                  p.winner
                    ? "The winner gains the other players’ remaining tile totals."
                    : `Remaining tiles deduct ${p.total} points from this round.`,
                )}
              </p>
              {p.rack.length > 0 ? (
                <details className="rack-calculation">
                  <summary>{t("Show remaining tiles and calculation")}</summary>
                  <p className="tile-calculation">
                    {p.rack.map((id, index) => (
                      <span key={id}>
                        {index > 0 ? " + " : ""}
                        {tiles[id].joker ? t("Joker (30)") : tiles[id].num}
                      </span>
                    ))}{" "}
                    = {p.total}
                  </p>
                  <TileDemo ids={p.rack} />
                </details>
              ) : (
                <p className="empty-rack-result">{t("No tiles left.")}</p>
              )}
            </article>
          ))}
      </div>
      <p className="replay-explanation">
        {t(
          game.match && champion === null
            ? "Deal the next round to keep match scores. Start over resets the match; Change settings opens your current options."
            : "Play again keeps your name, opponent count, difficulty, timer and guidance choice, with a fresh deal and zero scores. Change settings lets you edit those options.",
        )}
      </p>
      <MoveReview game={game} />
      <button className="secondary" onClick={onPractice}>
        {t("Try quick practice")}
      </button>
      <div className="hero-actions">
        {game.match && champion === null && (
          <button className="primary" onClick={onNextRound}>
            {t(`Deal round ${game.match.round + 1} →`)}
          </button>
        )}
        <button
          className={game.match && champion === null ? "secondary" : "primary"}
          onClick={onReplay}
        >
          {t(
            game.match && champion === null
              ? "Start over with same settings"
              : "Play again with same settings",
          )}
        </button>
        <button className="secondary" onClick={onNew}>
          {t("Change settings")}
        </button>
        <button className="secondary" onClick={onHome}>
          {t("Home")}
        </button>
      </div>
    </main>
  );
}
