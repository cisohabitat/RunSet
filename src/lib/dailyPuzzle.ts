import { exerciseKinds } from "../engine/exercises";
/** Local calendar date, not UTC time or a streak. Layouts may repeat. */
export function dailyPuzzle(now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new RangeError("Invalid date");
  const year = now.getFullYear(),
    month = now.getMonth(),
    day = now.getDate();
  const date = `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  let hash = 2166136261;
  for (const ch of date)
    hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0;
  const ordinal = Math.floor(Date.UTC(year, month, day) / 86400000);
  return {
    date,
    code: (hash % 999999) + 1,
    kind: exerciseKinds[((ordinal % 4) + 4) % 4],
  };
}
export function validDaily(
  date: unknown,
  kind: string,
  code: number,
): date is string {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return false;
  const parsed = new Date(`${date}T12:00:00`);
  if (!Number.isFinite(parsed.getTime())) return false;
  const puzzle = dailyPuzzle(parsed);
  return puzzle.date === date && puzzle.kind === kind && puzzle.code === code;
}
