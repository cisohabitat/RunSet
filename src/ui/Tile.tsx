import { useI18n } from "../i18n/I18n";
import { memo } from "react";
import { tiles } from "../engine/tiles";
import { TileFace } from "./TileFace";
import { useTouchClick } from "./useTouchClick";
export const Tile = memo(function Tile({
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
  onFocus?: (id: number) => void;
}) {
  const { t } = useI18n();
  const tile = tiles[id];
  const touchClick = useTouchClick(() => onSelect?.(id));
  return (
    <button
      type="button"
      data-tile-id={id}
      tabIndex={tabIndex}
      onFocus={() => onFocus?.(id)}
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
      {...touchClick}
      onClick={(event) => {
        event.stopPropagation();
        touchClick.onClick(event);
      }}
      disabled={!onSelect}
      draggable={draggable}
      onDragStart={(e) => {
        touchClick.onDragStart();
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
      <TileFace id={id} represents={represents} />
    </button>
  );
});
export function TileDemo({ ids }: { ids: number[] }) {
  return (
    <div className="tile-demo">
      {ids.map((id) => (
        <Tile key={id} id={id} />
      ))}
    </div>
  );
}
