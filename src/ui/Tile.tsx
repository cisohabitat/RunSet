import { useRef } from "react";
import { tiles } from "../engine/tiles";
const marks = { red: "◆", blue: "●", orange: "▲", black: "✦" };
export function Tile({
  id,
  selected = false,
  glow = false,
  onSelect,
  draggable = false,
  onDrag,
  represents,
  tabIndex,
  onFocus,
}: {
  id: number;
  selected?: boolean;
  glow?: boolean;
  onSelect?: (id: number) => void;
  draggable?: boolean;
  onDrag?: (id: number) => void;
  represents?: string;
  tabIndex?: number;
  onFocus?: () => void;
}) {
  const t = tiles[id];
  const pointer = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  return (
    <button
      type="button"
      data-tile-id={id}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        const group = e.currentTarget.closest(".rack-tiles,.meld-tiles");
        if (!group) return;
        const buttons = Array.from(
          group.querySelectorAll<HTMLButtonElement>(
            "button.tile:not(:disabled)",
          ),
        );
        const at = buttons.indexOf(e.currentTarget);
        if (at < 0) return;
        e.preventDefault();
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? buttons.length - 1
              : (at + (e.key === "ArrowLeft" ? -1 : 1) + buttons.length) %
                buttons.length;
        buttons[next]?.focus({ preventScroll: true });
        buttons[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }}
      className={`tile ${t.color ?? "joker"} ${selected ? "selected" : ""} ${glow ? "glow" : ""}`}
      title={
        t.joker && represents ? `Joker represents ${represents}` : undefined
      }
      aria-label={
        t.joker
          ? represents
            ? `Joker representing ${represents}`
            : "Joker"
          : `${t.color} ${t.num}`
      }
      aria-pressed={onSelect ? selected : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (pointer.current?.moved) {
          pointer.current = null;
          return;
        }
        onSelect?.(id);
        pointer.current = null;
      }}
      onPointerDown={(e) => {
        pointer.current = { x: e.clientX, y: e.clientY, moved: false };
      }}
      onPointerMove={(e) => {
        const p = pointer.current;
        if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8)
          p.moved = true;
      }}
      onPointerCancel={() => {
        if (pointer.current) pointer.current.moved = true;
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
        {t.joker ? (represents ?? "WILD") : marks[t.color!]}
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
