import { useI18n } from "../i18n/I18n";
import { useRef } from "react";
import { tiles } from "../engine/tiles";
const marks = { red: "◆", blue: "●", orange: "▲", black: "✦" };
export function Tile({
  id,
  selected = false,
  glow = false,
  recent = false,
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
  recent?: boolean;
  onSelect?: (id: number) => void;
  draggable?: boolean;
  onDrag?: (id: number) => void;
  represents?: string;
  tabIndex?: number;
  onFocus?: () => void;
}) {
  const { t } = useI18n();
  const tile = tiles[id];
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
      className={`tile ${tile.color ?? "joker"} ${selected ? "selected" : ""} ${glow ? "glow" : ""} ${recent ? "recent" : ""}`}
      aria-description={recent ? t("Played in the latest turn.") : undefined}
      title={t(
        tile.joker && represents ? `Joker represents ${represents}` : undefined,
      )}
      aria-label={t(
        tile.joker
          ? represents
            ? `Joker representing ${represents}`
            : "Joker"
          : `${tile.color} ${tile.num}`,
      )}
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
      {selected && (
        <span className="tile-check" aria-hidden="true">
          ✓
        </span>
      )}
      {recent && (
        <span className="tile-recent" aria-hidden="true">
          ●
        </span>
      )}
      <span className="tile-mark" aria-hidden="true">
        {t(tile.joker ? "★" : marks[tile.color!])}
      </span>
      <span>{t(tile.joker ? "★" : tile.num)}</span>
      <span className="tile-foot" aria-hidden="true">
        {t(tile.joker ? (represents ?? "WILD") : marks[tile.color!])}
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
