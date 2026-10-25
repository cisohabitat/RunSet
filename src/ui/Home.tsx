import { TileDemo } from "./Tile";
export function Home({
  onNew,
  onContinue,
  onHelp,
  hasSave,
}: {
  onNew: () => void;
  onContinue: () => void;
  onHelp: () => void;
  hasSave: boolean;
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
          Find your rhythm. Build a run. Make a set.
          <br />A timeless tile game, ready whenever you are.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={onNew}>
            Let’s play <span>↗</span>
          </button>
          {hasSave && (
            <button className="secondary" onClick={onContinue}>
              Continue game →
            </button>
          )}
          <button className="text-button" onClick={onHelp}>
            How to play <span>↗</span>
          </button>
        </div>
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
