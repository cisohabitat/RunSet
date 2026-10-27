import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
// A handled touch can still produce a trusted compatibility click on a new target.
// Keep its guard through a resulting unmount; the next pointer-down or timeout owns cleanup.
let stopCompatibilityGuard: (() => void) | undefined;
function guardCompatibilityClick() {
  stopCompatibilityGuard?.();
  const click = (event: MouseEvent) => {
    if (event.isTrusted && event.detail > 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  const remove = () => {
    window.removeEventListener("click", click, true);
    window.removeEventListener("pointerdown", remove, true);
    window.removeEventListener("pagehide", remove);
    window.clearTimeout(timer);
    if (stopCompatibilityGuard === remove) stopCompatibilityGuard = undefined;
  };
  const timer = window.setTimeout(remove, 1000);
  stopCompatibilityGuard = remove;
  window.addEventListener("click", click, { capture: true, passive: false });
  window.addEventListener("pointerdown", remove, { capture: true, once: true });
  window.addEventListener("pagehide", remove, { once: true });
}
/** Bind a completed tap to its original button even when WebKit focus-scroll
 * retargets pointer-up. Mouse dragging and keyboard keep their native path. */
export function useTouchClick(activate: () => void) {
  const pointer = useRef<{
      id: number;
      x: number;
      y: number;
      moved: boolean;
    } | null>(null),
    handled = useRef(false),
    cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  return {
    onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
      cleanup.current?.();
      const touch = event.pointerType === "touch";
      handled.current = touch;
      const start = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
      pointer.current = start;
      if (!touch) return;
      event.preventDefault();
      const target = event.currentTarget;
      const move = (next: PointerEvent) => {
        if (
          next.pointerId === start.id &&
          Math.hypot(next.clientX - start.x, next.clientY - start.y) > 8
        )
          start.moved = true;
      };
      const cancel = (next: PointerEvent) => {
        if (next.pointerId !== start.id) return;
        start.moved = true;
        cleanup.current?.();
      };
      const finish = (next: PointerEvent) => {
        if (next.pointerId !== start.id) return;
        cleanup.current?.();
        if (
          start.moved ||
          Math.hypot(next.clientX - start.x, next.clientY - start.y) > 8 ||
          !target.isConnected ||
          target.disabled
        )
          return;
        next.preventDefault();
        guardCompatibilityClick();
        target.click();
      };
      const remove = () => {
        window.removeEventListener("pointermove", move, true);
        window.removeEventListener("pointercancel", cancel, true);
        window.removeEventListener("pointerup", finish, true);
        cleanup.current = null;
      };
      cleanup.current = remove;
      window.addEventListener("pointermove", move, { capture: true });
      window.addEventListener("pointercancel", cancel, { capture: true });
      window.addEventListener("pointerup", finish, {
        capture: true,
        passive: false,
      });
    },
    onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
      const start = pointer.current;
      if (
        start &&
        event.pointerId === start.id &&
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
      )
        start.moved = true;
    },
    onPointerCancel() {
      if (pointer.current) pointer.current.moved = true;
      cleanup.current?.();
    },
    onDragStart() {
      if (pointer.current) pointer.current.moved = true;
      cleanup.current?.();
    },
    onClick(event: ReactMouseEvent<HTMLButtonElement>) {
      const moved = pointer.current?.moved;
      pointer.current = null;
      if (event.detail > 0 && (handled.current || moved)) return;
      activate();
    },
  };
}
