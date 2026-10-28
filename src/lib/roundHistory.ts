import { results, type GameState, type Difficulty } from "../engine/game";
export const ROUND_HISTORY_KEY = "runset.roundHistory.v1";
export interface RoundRecord {
  id: string;
  at: number;
  round: number;
  winner: number;
  players: { name: string; bot: Difficulty | null; score: number }[];
}
let generation = 0,
  writeFailed = false;
/** Local facts only; no tile allocations, logs, clocks or unfinished games. */
export function completedRound(game: GameState, at = Date.now()): RoundRecord {
  const scores = results(game),
    players = scores.map(({ name, bot, score }) => ({ name, bot, score })),
    round = game.match?.round ?? 1,
    winner = scores.findIndex((p) => p.winner);
  return {
    id: JSON.stringify([game.seed, round, game.turn, winner, players]),
    at,
    round,
    winner,
    players,
  };
}
export function decodeRoundHistory(raw: string | null): RoundRecord[] | null {
  if (raw === null) return [];
  if (raw.length > 65536) return null;
  try {
    const data = JSON.parse(raw);
    if (
      data?.version !== 1 ||
      !Array.isArray(data.rounds) ||
      data.rounds.length > 30
    )
      return null;
    const ids = new Set<string>();
    for (const r of data.rounds) {
      if (
        !r ||
        typeof r.id !== "string" ||
        !r.id.length ||
        r.id.length > 1024 ||
        ids.has(r.id) ||
        !Number.isSafeInteger(r.at) ||
        !Number.isFinite(new Date(r.at).getTime()) ||
        !Number.isSafeInteger(r.round) ||
        r.round < 1 ||
        !Array.isArray(r.players) ||
        r.players.length < 2 ||
        r.players.length > 4 ||
        !Number.isInteger(r.winner) ||
        r.winner < 0 ||
        r.winner >= r.players.length
      )
        return null;
      ids.add(r.id);
      if (
        r.players.some(
          (p: RoundRecord["players"][number]) =>
            !p ||
            typeof p.name !== "string" ||
            p.name.length < 1 ||
            p.name.length > 24 ||
            ![null, "easy", "normal", "hard"].includes(p.bot) ||
            !Number.isInteger(p.score) ||
            Math.abs(p.score) > 2000,
        ) ||
        r.players.filter((p: RoundRecord["players"][number]) => p.bot === null)
          .length !== 1 ||
        r.players.reduce(
          (n: number, p: RoundRecord["players"][number]) => n + p.score,
          0,
        ) !== 0 ||
        r.players.some((p: RoundRecord["players"][number], i: number) =>
          i === r.winner ? p.score < 0 : p.score > 0,
        )
      )
        return null;
    }
    return data.rounds.map((r: RoundRecord) => ({
      id: r.id,
      at: r.at,
      round: r.round,
      winner: r.winner,
      players: r.players.map(({ name, bot, score }) => ({ name, bot, score })),
    }));
  } catch {
    return null;
  }
}
export function readRoundHistory() {
  try {
    return {
      rounds: decodeRoundHistory(localStorage.getItem(ROUND_HISTORY_KEY)),
      writeFailed,
    };
  } catch {
    return { rounds: null, writeFailed };
  }
}
async function locked(action: () => boolean): Promise<boolean> {
  try {
    return navigator.locks
      ? await navigator.locks.request(ROUND_HISTORY_KEY, action)
      : action();
  } catch {
    return false;
  }
}
/** Called only after an observed real playing→over transition in the same visit. */
export async function rememberRound(game: GameState): Promise<boolean> {
  if (game.phase !== "over") return true;
  const record = completedRound(game),
    expected = generation;
  const ok = await locked(() => {
    if (generation !== expected) return true;
    const { rounds } = readRoundHistory();
    if (!rounds) return false;
    if (rounds.some((r) => r.id === record.id)) return true;
    localStorage.setItem(
      ROUND_HISTORY_KEY,
      JSON.stringify({ version: 1, rounds: [...rounds, record].slice(-30) }),
    );
    return true;
  });
  writeFailed = !ok;
  return ok;
}
export async function clearRoundHistory(): Promise<boolean> {
  generation++;
  const ok = await locked(() => {
    localStorage.removeItem(ROUND_HISTORY_KEY);
    return true;
  });
  if (ok) writeFailed = false;
  return ok;
}
