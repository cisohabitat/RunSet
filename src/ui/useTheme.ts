import { useLayoutEffect, useState } from "react";
export type Theme = "system" | "light" | "dark";
/** Display-only choice: never remount or write a game when it changes. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem("runset.theme");
      return raw === "light" || raw === "dark" ? raw : "system";
    } catch {
      return "system";
    }
  });
  useLayoutEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return [theme, setTheme] as const;
}
