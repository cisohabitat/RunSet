import { useEffect, useRef } from "react";
/** Focus a newly opened screen once, including a late lazy-loaded heading. */
export function useScreenFocus(screen: string) {
  const previous = useRef(screen);
  useEffect(() => {
    if (previous.current === screen) return;
    previous.current = screen;
    window.scrollTo(0, 0);
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
      }
      return true;
    };
    if (focus()) return;
    const observer = new MutationObserver(() => {
      if (focus()) observer.disconnect();
    });
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "hidden", "aria-busy"],
    });
    return () => observer.disconnect();
  }, [screen]);
}
