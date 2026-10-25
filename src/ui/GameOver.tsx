import { type GameState, results } from "../engine/game";
import { TileDemo } from "./Tile";
export function GameOver({
  game,
  onNew,
  onHome,
}: {
  game: GameState;
  onNew: () => void;
  onHome: () => void;
}) {
  const scores = results(game),
    winner = scores.find((p) => p.winner)!;
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
      <div className="eyebrow">THAT’S A WRAP</div>
      <h1>
        {!winner.bot ? "Beautifully played." : `${winner.name} takes it.`}
      </h1>
      <p>
        {!winner.bot
          ? "The table was full of possibilities. You found yours."
          : "A good game always leaves room for another."}
      </p>
      <div className="scoreboard">
        {scores.map((p) => (
          <article key={p.name}>
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
