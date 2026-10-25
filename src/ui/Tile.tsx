import { tiles } from "../engine/tiles";
const marks = { red: "◆", blue: "●", orange: "▲", black: "✦" };
export function Tile({
  id,
  selected = false,
  glow = false,
  onSelect,
  draggable = false,
  onDrag,
}: {
  id: number;
  selected?: boolean;
  glow?: boolean;
  onSelect?: (id: number) => void;
  draggable?: boolean;
  onDrag?: (id: number) => void;
}) {
  const t = tiles[id];
  return (
    <button
      type="button"
      className={`tile ${t.color ?? "joker"} ${selected ? "selected" : ""} ${glow ? "glow" : ""}`}
      aria-label={t.joker ? "Joker" : `${t.color} ${t.num}`}
      aria-pressed={onSelect ? selected : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      disabled={!onSelect}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(id));
        onDrag?.(id);
      }}
    >
      <span className="tile-mark" aria-hidden="true">
        {t.joker ? "★" : marks[t.color!]}
      </span>
      <span>{t.joker ? "★" : t.num}</span>
      <span className="tile-foot" aria-hidden="true">
        {t.joker ? "WILD" : marks[t.color!]}
      </span>
    </button>
  );
}
export function TileDemo({ ids }: { ids: number[] }) {
  return (
    <div className="tile-demo">
      {ids.map((id) => (
        <Tile key={id} id={id} />
      ))}
    </div>
  );
}
