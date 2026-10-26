import { useI18n } from "../i18n/I18n";
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
  const { t } = useI18n();
  return (
    <main className="home">
      <div className="hero-copy">
        <div className="eyebrow">
          <span />
          {t(" THE CLASSIC, WITH A FRESH SHUFFLE")}
        </div>
        <h1>
          {t("A little strategy.")}
          <br />
          {t("A perfect ")}
          <em>{t("run.")}</em>
        </h1>
        <p className="intro">
          {t(
            "Be the first to play all the tiles from your rack. Match numbers in different colours, or build a sequence in one colour. New to tile-rummy? We’ll teach you, one move at a time.",
          )}
        </p>
        <div className="hero-actions">
          {hasSave && (
            <button className="primary" onClick={onContinue}>
              {t(game?.phase === "over" ? "View results →" : "Continue game →")}
            </button>
          )}
          <button
            className={hasSave ? "secondary" : "primary"}
            onClick={onLearn}
          >
            {t("Learn to play ")}
            <span>→</span>
          </button>
          <button className="secondary" onClick={onNew}>
            {t("New game →")}
          </button>
          <button className="text-button" onClick={onHelp}>
            {t("How to play ")}
            <span>→</span>
          </button>
        </div>
        {game && (
          <section className="save-summary" aria-label={t("Saved game")}>
            <strong>
              {t(
                `${game.players.find((p) => !p.bot)?.name}’s ${game.phase === "over" ? "completed" : "saved"} game`,
              )}
            </strong>
            <p>
              {t(
                game.match &&
                  `Match to ${game.match.target} · round ${game.match.round} · `,
              )}
              {game.players.length - 1}
              {t(" opponent(s) ·")} {t(game.players.find((p) => p.bot)?.bot)} ·{" "}
              {t(
                game.phase === "over"
                  ? "Round finished"
                  : `${game.players[game.current].name}’s turn`,
              )}
            </p>
            <button className="text-button danger-text" onClick={onDelete}>
              {t("Delete saved game")}
            </button>
          </section>
        )}
        <div className="hero-meta">
          <span>{t("✓ Free to play")}</span>
          <span>{t("✓ No sign-up")}</span>
          <span>{t("✓ Just one more round")}</span>
        </div>
      </div>
      <div
        className="hero-art"
        aria-label={t("Illustration of tile runs and sets")}
      >
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <span className="art-label label-top">
          {t("A GOOD HAND IS ONLY THE BEGINNING.")}
        </span>
        <div className="art-row row-one">
          <TileDemo ids={[3, 4, 5, 6]} />
          <span className="hand-note">{t("make a run →")}</span>
        </div>
        <div className="art-row row-two">
          <TileDemo ids={[9, 35, 61]} />
          <span className="hand-note">{t("find your set")}</span>
        </div>
        <div className="art-row row-three">
          <TileDemo ids={[80, 81, 104]} />
        </div>
        <span className="art-label label-bottom">
          {t("106 TILES. ENDLESS POSSIBILITIES.")}
        </span>
        <span className="spark spark-one">✳</span>
        <span className="spark spark-two">✦</span>
      </div>
      <div className="home-bottom">
        <span>{t("YOUR TABLE IS ALWAYS OPEN")}</span>
        <p>
          {t("One player. Clever opponents. A whole lot of possibilities.")}
        </p>
        <span className="small-tiles">◆ ● ▲ ✦</span>
      </div>
    </main>
  );
}
