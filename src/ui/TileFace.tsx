import { useI18n } from "../i18n/I18n";
import { tiles } from "../engine/tiles";
const marks = { red: "◆", blue: "●", orange: "▲", black: "✦" };
export function TileFace({
  id,
  represents,
}: {
  id: number;
  represents?: string;
}) {
  const { t } = useI18n(),
    tile = tiles[id];
  return (
    <>
      <span className="tile-mark" aria-hidden="true">
        {t(tile.joker ? "★" : marks[tile.color!])}
      </span>
      <span>{t(tile.joker ? "★" : tile.num)}</span>
      <span className="tile-foot" aria-hidden="true">
        {t(tile.joker ? (represents ?? "WILD") : marks[tile.color!])}
      </span>
    </>
  );
}
/** Home artwork has no interactive behavior or focusable disabled controls. */
export function TileArt({ ids }: { ids: number[] }) {
  const { t } = useI18n();
  return (
    <div className="tile-demo">
      {ids.map((id) => {
        const tile = tiles[id];
        return (
          <div
            key={id}
            className={`tile ${tile.color ?? "joker"}`}
            role="img"
            aria-label={t(tile.joker ? "Joker" : `${tile.color} ${tile.num}`)}
          >
            <TileFace id={id} />
          </div>
        );
      })}
    </div>
  );
}
