import { useEffect, useRef } from "react";
/** Focus a newly opened screen once, including a late lazy-loaded heading. */
export function useScreenFocus(screen: string) {
  const previous = useRef(screen);
  useEffect(() => {
    if (previous.current === screen) return;
    previous.current = screen;
    window.scrollTo(0, 0);
    let revealFrame: number | undefined;
    const cancelReveal = () => {
      if (revealFrame !== undefined) cancelAnimationFrame(revealFrame);
    };
    const focus = () => {
      const heading = Array.from(
        document.querySelectorAll<HTMLElement>(
          'main:not([aria-busy="true"]) h1',
        ),
      ).find((node) => node.getClientRects().length > 0);
      if (!heading) return false;
      // A native dialog owns focus until it closes.
      if (!document.querySelector("dialog[open]")) {
        const target =
          screen === "game"
            ? (document.querySelector<HTMLElement>(
                "main .rack button.tile:not(:disabled)",
              ) ?? heading)
            : heading;
        if (target === heading) heading.tabIndex = -1;
        target.focus({ preventScroll: true });
        if (screen === "game" && target !== heading) {
          // Let route scrolling finish before revealing the focused rack tile.
          revealFrame = requestAnimationFrame(() => {
            if (
              target.isConnected &&
              !target.matches(":disabled") &&
              document.activeElement === target &&
              !document.querySelector("dialog[open]")
            ) {
              target.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
          });
        }
      }
      return true;
    };
    if (focus()) return cancelReveal;
    const observer = new MutationObserver(() => {
      if (focus()) observer.disconnect();
    });
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "hidden", "aria-busy"],
    });
    return () => {
      observer.disconnect();
      cancelReveal();
    };
  }, [screen]);
}
