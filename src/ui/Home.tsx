import type { GameState } from "../engine/game";
import { TileDemo } from "./Tile";
export function Home({
  onNew,
  onContinue,
  onHelp,
  hasSave,
  onLearn,
  onDelete,
  game,
}: {
  onNew: () => void;
  onContinue: () => void;
  onHelp: () => void;
  hasSave: boolean;
  onLearn: () => void;
  onDelete: () => void;
  game: GameState | null;
}) {
  return (
    <main className="home">
      <div className="hero-copy">
        <div className="eyebrow">
          <span /> THE CLASSIC, WITH A FRESH SHUFFLE
        </div>
        <h1>
          A little strategy.
          <br />A perfect <em>run.</em>
        </h1>
        <p className="intro">
          Be the first to play all the tiles from your rack. Match numbers in
          different colours, or build a sequence in one colour. New to
          tile-rummy? We’ll teach you, one move at a time.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={onLearn}>
            Learn to play <span>↗</span>
          </button>
          <button className="secondary" onClick={onNew}>
            New game →
          </button>
          {hasSave && (
            <button className="secondary" onClick={onContinue}>
              {game?.phase === "over" ? "View results →" : "Continue game →"}
            </button>
          )}
          <button className="text-button" onClick={onHelp}>
            How to play <span>↗</span>
          </button>
        </div>
        {game && (
          <section className="save-summary" aria-label="Saved game">
            <strong>
              {game.players.find((p) => !p.bot)?.name}’s{" "}
              {game.phase === "over" ? "completed" : "saved"} game
            </strong>
            <p>
              {game.match &&
                `Match to ${game.match.target} · round ${game.match.round} · `}
              {game.players.length - 1} opponent(s) ·{" "}
              {game.players.find((p) => p.bot)?.bot} ·{" "}
              {game.phase === "over"
                ? "Round finished"
                : `${game.players[game.current].name}’s turn`}
            </p>
            <button className="text-button danger-text" onClick={onDelete}>
              Delete saved game
            </button>
          </section>
        )}
        <div className="hero-meta">
          <span>✓ Free to play</span>
          <span>✓ No sign-up</span>
          <span>✓ Just one more round</span>
        </div>
      </div>
      <div className="hero-art" aria-label="Illustration of tile runs and sets">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <span className="art-label label-top">
          A GOOD HAND IS ONLY THE BEGINNING.
        </span>
        <div className="art-row row-one">
          <TileDemo ids={[3, 4, 5, 6]} />
          <span className="hand-note">make a run ↗</span>
        </div>
        <div className="art-row row-two">
          <TileDemo ids={[9, 35, 61]} />
          <span className="hand-note">find your set</span>
        </div>
        <div className="art-row row-three">
          <TileDemo ids={[80, 81, 104]} />
        </div>
        <span className="art-label label-bottom">
          106 TILES. ENDLESS POSSIBILITIES.
        </span>
        <span className="spark spark-one">✳</span>
        <span className="spark spark-two">✦</span>
      </div>
      <div className="home-bottom">
        <span>YOUR TABLE IS ALWAYS OPEN</span>
        <p>One player. Clever opponents. A whole lot of possibilities.</p>
        <span className="small-tiles">◆ ● ▲ ✦</span>
      </div>
    </main>
  );
}
