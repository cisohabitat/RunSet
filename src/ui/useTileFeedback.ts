import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import type { GameState } from "../engine/game";
import { latestEdit } from "../lib/boardLocation";

/** Small destination landings; game state updates immediately and motion is optional. */
export function useTileFeedback(
  root: RefObject<HTMLElement | null>,
  game: GameState,
  layoutKey: string,
) {
  const previous = useRef(
    new Map<
      number,
      { parent: HTMLElement | null; x: number; y: number; visible: boolean }
    >(),
  );
  const active = useRef<Animation[]>([]);
  const observed = useRef(game);
  useLayoutEffect(() => {
    active.current.forEach((animation) => animation.cancel());
    active.current = [];
    const next = new Map<
      number,
      { parent: HTMLElement | null; x: number; y: number; visible: boolean }
    >();
    const edited = new Set(
      latestEdit(observed.current, game).map((edit) => edit.id),
    );
    observed.current = game;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.current
      ?.querySelectorAll<HTMLElement>(".table .tile, .rack .tile")
      .forEach((el) => {
        if (el.closest("dialog")) return;
        const id = Number(el.dataset.tileId),
          rect = el.getBoundingClientRect();
        const region = el.closest(".table, .rack")!.getBoundingClientRect();
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          Math.min(rect.right, region.right, innerWidth) >
            Math.max(rect.left, region.left, 0) &&
          Math.min(rect.bottom, region.bottom, innerHeight) >
            Math.max(rect.top, region.top, 0);
        const old = previous.current.get(id),
          parent = el.parentElement;
        if (
          old &&
          old.visible &&
          old.parent !== parent &&
          Math.abs(old.x - rect.x) + Math.abs(old.y - rect.y) > 1 &&
          visible &&
          edited.has(id) &&
          !document.hidden &&
          !reduced &&
          typeof el.animate === "function"
        ) {
          const dx = old.x - rect.x,
            dy = old.y - rect.y;
          const scale = Math.min(1, 12 / Math.max(1, Math.hypot(dx, dy)));
          active.current.push(
            el.animate(
              [
                {
                  opacity: 0.7,
                  translate: `${(dx * scale).toFixed(2)}px ${(dy * scale).toFixed(2)}px`,
                },
                { opacity: 1, translate: "0 0" },
              ],
              { duration: 160, easing: "ease-out" },
            ),
          );
        }
        next.set(id, { parent, x: rect.x, y: rect.y, visible });
      });
    previous.current = next;
  }, [game, layoutKey, root]);
  useEffect(() => {
    const clear = () => {
      active.current.forEach((animation) => animation.cancel());
      active.current = [];
      previous.current.clear();
    };
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener("change", clear);
    window.addEventListener("resize", clear);
    window.addEventListener("pagehide", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      preference.removeEventListener("change", clear);
      window.removeEventListener("resize", clear);
      window.removeEventListener("pagehide", clear);
      document.removeEventListener("visibilitychange", clear);
      clear();
    };
  }, []);
}
