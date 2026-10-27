import { useEffect, useState } from "react";
/** Independent optional boolean; a failed browser write never blocks play. */
export function usePreference(
  key: string,
  fallback = false,
  unavailable = fallback,
) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return fallback ? raw !== "false" : raw === "true";
    } catch {
      return unavailable;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      /* Optional preference. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
