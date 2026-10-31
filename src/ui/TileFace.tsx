import { useI18n } from "../i18n/I18n";
import { tiles } from "../engine/tiles";
const symbols = {
  red: "M5 0 10 5 5 10 0 5Z",
  blue: "M5 0a5 5 0 1 0 0 10a5 5 0 1 0 0-10",
  orange: "M5 0 10 10H0Z",
  black: "M5 0 6.5 3.5 10 5 6.5 6.5 5 10 3.5 6.5 0 5 3.5 3.5Z",
  joker: "M5 0 6.5 3.5 10 3.8 7.3 6.4 8 10 5 8.3 2 10 2.7 6.4 0 3.8 3.5 3.5Z",
};
/** Decorative shapes retain their size when browser minimum fonts increase. */
function TileSymbol({ color }: { color: keyof typeof symbols }) {
  return (
    <svg className="tile-symbol" viewBox="0 0 10 10" width="6" height="6" aria-hidden="true" focusable="false">
      <path d={symbols[color]} />
    </svg>
  );
}
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
        <TileSymbol color={tile.color ?? "joker"} />
      </span>
      <span>{t(tile.joker ? "★" : tile.num)}</span>
      <span className="tile-foot" aria-hidden="true">
        {tile.joker ? t(represents ?? "WILD") : <TileSymbol color={tile.color!} />}
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
