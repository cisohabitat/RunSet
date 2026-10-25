import { inspectMeld } from "../engine/meld";
import { type GameState } from "../engine/game";
export const SAVE_KEY = "runset.save.v1";
export function validSave(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const s = value as GameState;
  if (
    s.version !== 1 ||
    !["playing", "over"].includes(s.phase) ||
    !Array.isArray(s.players) ||
    s.players.length < 2 ||
    s.players.length > 4 ||
    !Number.isInteger(s.current) ||
    !s.players[s.current] ||
    !Array.isArray(s.pool) ||
    !Array.isArray(s.table) ||
    !s.turnStart ||
    !Array.isArray(s.turnStart.table) ||
    !Array.isArray(s.turnStart.rack) ||
    !Array.isArray(s.lastPlaced) ||
    !Array.isArray(s.log) ||
    !Number.isFinite(s.turn) ||
    !Number.isFinite(s.seed) ||
    !Number.isInteger(s.passes)
  )
    return false;
  if (
    s.players.some(
      (p) =>
        typeof p.name !== "string" ||
        ![null, "easy", "normal", "hard"].includes(p.bot) ||
        typeof p.melded !== "boolean" ||
        !Array.isArray(p.rack),
    ) ||
    s.players.filter((p) => p.bot === null).length !== 1 ||
    s.table.some((m) => typeof m.id !== "string" || !Array.isArray(m.tiles))
  )
    return false;
  if (
    s.log.some((x) => typeof x !== "string") ||
    s.lastPlaced.some((id) => !Number.isInteger(id) || id < 0 || id > 105) ||
    s.turnStart.table.some(
      (m) =>
        typeof m.id !== "string" ||
        !Array.isArray(m.tiles) ||
        m.tiles.some((id) => !Number.isInteger(id) || id < 0 || id > 105) ||
        !inspectMeld(m.tiles).valid,
    )
  )
    return false;
  const snapshot = [
    ...s.turnStart.rack,
    ...s.turnStart.table.flatMap((m) => m.tiles),
  ];
  const active = [
    ...s.players[s.current].rack,
    ...s.table.flatMap((m) => m.tiles),
  ];
  if (
    new Set(snapshot).size !== snapshot.length ||
    snapshot.length !== active.length ||
    snapshot.some((id) => !active.includes(id))
  )
    return false;
  if (new Set(s.table.map((m) => m.id)).size !== s.table.length) return false;
  const ids = [
    ...s.pool,
    ...s.players.flatMap((p) => p.rack),
    ...s.table.flatMap((m) => m.tiles),
  ];
  return (
    ids.length === 106 &&
    new Set(ids).size === 106 &&
    ids.every((id) => Number.isInteger(id) && id >= 0 && id < 106)
  );
}
export function loadGame(): { game: GameState | null; notice: string } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { game: null, notice: "" };
    const s: unknown = JSON.parse(raw);
    if (!validSave(s)) {
      localStorage.removeItem(SAVE_KEY);
      return {
        game: null,
        notice: "An old or unreadable save was discarded. Start a fresh game.",
      };
    }
    return { game: s, notice: "" };
  } catch {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* Storage may be disabled. */
    }
    return {
      game: null,
      notice: "Your save could not be read. You can still start a new game.",
    };
  }
}
export function saveGame(game: GameState): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}
