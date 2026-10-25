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
        {game.match ? `ROUND ${game.match.round} COMPLETE` : "THAT’S A WRAP"}
      </div>
      <h1>
        {!winner.bot ? "Beautifully played." : `${winner.name} takes it.`}
      </h1>
      <p>
        {!winner.bot
          ? "The table was full of possibilities. You found yours."
          : "A good game always leaves room for another."}
      </p>
      {game.match && (
        <section className="match-scores" aria-label="Match scoreboard">
          <h2>
            {champion === null
              ? `First to ${game.match.target}`
              : `${game.players[champion].name} wins the match!`}
          </h2>
          {game.players.map((p, i) => (
            <p key={i}>
              {p.name}: <strong>{game.match!.totals[i]}</strong> total points
            </p>
          ))}
          <details>
            <summary>Round scores</summary>
            {game.match.rounds.map((round, i) => (
              <p key={i}>
                Round {i + 1}:{" "}
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
        {scores.map((p, i) => (
          <article key={i}>
            <div>
              <h2>
                {p.name}{" "}
                {p.winner && <span className="winner-badge">Winner</span>}
              </h2>
              <p>
                {p.rack.length} tiles remaining · rack value {p.total}
              </p>
            </div>
            <strong>
              {p.score > 0 ? "+" : ""}
              {p.score}
            </strong>
            {p.rack.length > 0 && <TileDemo ids={p.rack} />}
          </article>
        ))}
      </div>
      <div className="hero-actions">
        {game.match && champion === null && (
          <button className="primary" onClick={onNextRound}>
            Deal round {game.match.round + 1} →
          </button>
        )}
        <button className="primary" onClick={onNew}>
          Play again ↗
        </button>
        <button className="secondary" onClick={onHome}>
          Home
        </button>
      </div>
    </main>
  );
}
