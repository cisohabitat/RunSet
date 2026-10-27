import { useEffect, useRef, useState } from "react";
import type { GameState } from "../engine/game";
import { latestEdit, tileLocation, type Landing } from "../lib/boardLocation";
import { useI18n } from "../i18n/I18n";
export function BoardFinder({
  game,
  selected,
  disabled,
  onFind,
}: {
  game: GameState;
  selected: number[];
  disabled: boolean;
  onFind: (
    id: number,
    index: number,
    total: number,
    kind: "selected" | "latest",
  ) => void;
}) {
  const { t } = useI18n();
  const previous = useRef(game),
    cycles = useRef({
      selected: { key: "", at: 0 },
      latest: { key: "", at: 0 },
    });
  const [recent, setRecent] = useState<Landing[]>([]);
  useEffect(() => {
    const next = latestEdit(previous.current, game);
    previous.current = game;
    setRecent((old) =>
      next.length
        ? next
        : old.length
          ? old.filter((x) => tileLocation(game, x.id) === x.location)
          : old,
    );
  }, [game]);
  const current = recent
    .filter((x) => tileLocation(game, x.id) === x.location)
    .map((x) => x.id);
  const latest = current.length
    ? current
    : game.lastPlaced.filter((id) =>
        game.table.some((m) => m.tiles.includes(id)),
      );
  const find = (kind: "selected" | "latest", ids: number[]) => {
    if (!ids.length) return;
    const key = ids.join(","),
      cycle = cycles.current[kind],
      at = cycle.key === key ? cycle.at % ids.length : 0;
    cycles.current[kind] = { key, at: at + 1 };
    onFind(ids[at], at + 1, ids.length, kind);
  };
  return (
    <>
      <button
        className="text-button board-finder"
        disabled={disabled || !selected.length}
        onClick={() => find("selected", selected)}
      >
        {t("Find selected tiles")}
      </button>
      <button
        className="text-button board-finder"
        disabled={disabled || !latest.length}
        onClick={() => find("latest", latest)}
      >
        {t("Find latest placement")}
      </button>
      <p>
        {t(
          "Each tap finds the next tile. Your selection and game stay the same.",
        )}
      </p>
    </>
  );
}
