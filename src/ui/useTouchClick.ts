import { useRef, type PointerEvent, type MouseEvent } from "react";
/** Keep a completed touch tap tied to its button when WebKit scrolls during focus.
 * Mouse/keyboard retain native click behavior; scrolling/cancelled touches do nothing. */
export function useTouchClick(activate: () => void) {
  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const handled = useRef(false);
  return {
    onPointerDown(event: PointerEvent<HTMLButtonElement>) {
      handled.current = false;
      pointer.current = null;
      if (event.pointerType !== "touch") return;
      handled.current = true;
      event.preventDefault();
      pointer.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
    },
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      const start = pointer.current;
      if (
        start &&
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
      )
        start.moved = true;
    },
    onPointerCancel() {
      pointer.current = null;
    },
    onPointerUp(event: PointerEvent<HTMLButtonElement>) {
      const start = pointer.current;
      pointer.current = null;
      if (
        !start ||
        start.id !== event.pointerId ||
        start.moved ||
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
      )
        return;
      if (
        !event.currentTarget.contains(
          document.elementFromPoint(event.clientX, event.clientY),
        )
      )
        return;
      event.currentTarget.click();
    },
    onClick(event: MouseEvent<HTMLButtonElement>) {
      if (!handled.current || event.detail === 0) activate();
    },
  };
}
