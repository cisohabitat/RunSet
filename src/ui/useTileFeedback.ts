import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import type { GameState } from "../engine/game";

/** Small destination landings; game state updates immediately and motion is optional. */
export function useTileFeedback(
  root: RefObject<HTMLElement | null>,
  game: GameState,
) {
  const previous = useRef(
    new Map<
      number,
      { parent: HTMLElement | null; x: number; y: number; visible: boolean }
    >(),
  );
  const active = useRef<Animation[]>([]);
  useLayoutEffect(() => {
    active.current.forEach((animation) => animation.cancel());
    active.current = [];
    const next = new Map<
      number,
      { parent: HTMLElement | null; x: number; y: number; visible: boolean }
    >();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.current
      ?.querySelectorAll<HTMLElement>(".table .tile, .rack .tile")
      .forEach((el) => {
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
        const moved =
          old &&
          old.visible &&
          old.parent !== parent &&
          Math.abs(old.x - rect.x) + Math.abs(old.y - rect.y) > 1;
        if (
          visible &&
          !reduced &&
          typeof el.animate === "function" &&
          (moved ||
            (!old && !!el.closest(".table") && game.lastPlaced.includes(id)))
        ) {
          active.current.push(
            el.animate(
              [
                { opacity: 0.35, translate: "0 6px" },
                { opacity: 1, translate: "0 0" },
              ],
              { duration: 180, easing: "ease-out" },
            ),
          );
        }
        next.set(id, { parent, x: rect.x, y: rect.y, visible });
      });
    previous.current = next;
  });
  useEffect(() => {
    const clear = () => {
      active.current.forEach((animation) => animation.cancel());
      active.current = [];
      previous.current.clear();
    };
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener("change", clear);
    window.addEventListener("resize", clear);
    return () => {
      preference.removeEventListener("change", clear);
      window.removeEventListener("resize", clear);
      clear();
    };
  }, []);
}
