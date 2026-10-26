import { useI18n } from "../i18n/I18n";
import { TileDemo } from "./Tile";
export function HowToPlay({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  return (
    <main className="page guide">
      <button className="text-button" onClick={onBack}>
        {t("← Back")}
      </button>
      <div className="eyebrow">{t("FIVE MINUTES TO YOUR FIRST MOVE")}</div>
      <h1>
        {t("Small tiles.")}
        <br />
        <em>{t("Big possibilities.")}</em>
      </h1>
      <p className="intro">
        {t(
          "Based on the classic tile-rummy game. Your goal is simple: be the first to empty your rack.",
        )}
      </p>
      <div className="guide-grid">
        <article>
          <span className="step">{t("01 / THE TILES")}</span>
          <h2>{t("A colourful cast.")}</h2>
          <TileDemo ids={[0, 26, 52, 78, 104]} />
          <p>
            {t(
              "106 tiles: two of every number from 1 to 13 in four colours, plus two jokers. Everyone starts with 14 tiles. Shape marks make colours easy to tell apart.",
            )}
          </p>
        </article>
        <article>
          <span className="step">{t("02 / GROUPS")}</span>
          <h2>{t("Same number. Different colours.")}</h2>
          <TileDemo ids={[6, 32, 58]} />
          <p>
            {t(
              "A group has 3 or 4 tiles of the same number, each a different colour. Duplicate colours don’t count.",
            )}
          </p>
        </article>
        <article>
          <span className="step">{t("03 / RUNS")}</span>
          <h2>{t("One colour. In sequence.")}</h2>
          <TileDemo ids={[28, 29, 30, 31]} />
          <p>
            {t(
              "A run has at least 3 consecutive numbers of one colour. 1 is always low: 12, 13, 1 is never a run.",
            )}
          </p>
        </article>
        <article>
          <span className="step">{t("04 / JOKERS")}</span>
          <h2>{t("A little wild.")}</h2>
          <TileDemo ids={[3, 104, 5]} />
          <p>
            {t(
              "A joker stands in for a missing tile. Here it counts as 5. To retrieve a table joker, replace it with the exact rack tile it represents and reuse it in a valid meld that turn. For groups, the joker’s missing colour follows red, blue, orange, black order.",
            )}
          </p>
        </article>
        <article>
          <span className="step">{t("05 / YOUR OPENING")}</span>
          <h2>{t("Make your first 30.")}</h2>
          <TileDemo ids={[9, 35, 61]} />
          <p>
            {t(
              "Your first play must total at least 30 points, using only tiles from your own rack. A joker counts as the number it replaces. Until then, leave existing table melds untouched.",
            )}
          </p>
        </article>
        <article>
          <span className="step">{t("06 / EACH TURN")}</span>
          <h2>{t("Play. Or draw.")}</h2>
          <p>
            {t(
              "Play at least one rack tile, then end your turn. Or draw one tile and your turn ends. Drawing first restores unfinished moves. No pool left? Pass instead. Everyone passing in succession ends the game.",
            )}
          </p>
          <p>
            <strong>{t("Watch the red outline:")}</strong>
            {t(
              " ending an invalid turn restores your moves and draws 3 penalty tiles, or as many as remain. Reset turn undoes your moves freely.",
            )}
          </p>
        </article>
        <article>
          <span className="step">{t("07 / REARRANGE")}</span>
          <h2>{t("See a new possibility?")}</h2>
          <p>
            {t(
              "After opening, split, merge, and rearrange table melds freely. Every tile must belong to a valid meld when you finish. Table tiles can never go back to a rack.",
            )}
          </p>
          <p>
            {t(
              "Tap or click tiles to select, then choose a meld or “New meld”. You can also drag a tile or selection. To return tiles you placed this turn, choose More, then Return selected tiles to rack. Keyboard: Tab to tiles, Space to select, then activate a destination button.",
            )}
          </p>
        </article>
        <article>
          <span className="step">{t("08 / WINNING")}</span>
          <h2>{t("Leave nothing behind.")}</h2>
          <p>
            {t(
              "First to empty their rack wins. Each other player loses their remaining tile total (jokers count as 30); the winner earns the sum. When the pool runs out and everyone passes, the lowest rack total wins; a tie goes to the first tied player in seat order.",
            )}
          </p>
          <p>
            {t(
              "Your round saves automatically, even mid-turn. Head home and choose Continue whenever you’re ready.",
            )}
          </p>
        </article>
      </div>
      <button className="primary" onClick={onBack}>
        {t("Got it. Let’s play →")}
      </button>
    </main>
  );
}
