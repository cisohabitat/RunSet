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
  if (s.turnSeconds !== undefined && ![0, 60, 120].includes(s.turnSeconds))
    return false;
  if (s.turnSeconds && (!Number.isFinite(s.deadline) || s.deadline! < 0))
    return false;
  if (s.match) {
    const m = s.match;
    if (
      ![100, 200, 500].includes(m.target) ||
      !Number.isInteger(m.round) ||
      m.round < 1 ||
      !Array.isArray(m.totals) ||
      m.totals.length !== s.players.length ||
      m.totals.some((n) => !Number.isFinite(n)) ||
      !Array.isArray(m.rounds) ||
      m.rounds.length !== m.round - (s.phase === "playing" ? 1 : 0) ||
      m.rounds.some(
        (r) =>
          !r ||
          !Array.isArray(r.scores) ||
          r.scores.length !== s.players.length ||
          r.scores.some((n) => !Number.isFinite(n)) ||
          !Number.isInteger(r.winner) ||
          r.winner < 0 ||
          r.winner >= s.players.length,
      )
    )
      return false;
    if (
      m.totals.some(
        (n, i) => n !== m.rounds.reduce((sum, r) => sum + r.scores[i], 0),
      )
    )
      return false;
  }
  if (
    s.history !== undefined &&
    (!Array.isArray(s.history) ||
      s.history.length > 100 ||
      s.history.some((h) => {
        if (
          !h ||
          !Array.isArray(h.rack) ||
          !Array.isArray(h.table) ||
          h.table.some(
            (m) => !m || typeof m.id !== "string" || !Array.isArray(m.tiles),
          )
        )
          return true;
        const ids = [...h.rack, ...h.table.flatMap((m) => m.tiles)];
        return (
          ids.length !== active.length ||
          new Set(ids).size !== ids.length ||
          ids.some((id) => !active.includes(id))
        );
      }))
  )
    return false;
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

/** Remove only game progress. Preferences and practice data belong to separate keys. */
export function deleteGame(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY);
    return localStorage.getItem(SAVE_KEY) === null;
  } catch {
    return false;
  }
}
