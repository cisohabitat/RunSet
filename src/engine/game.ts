import { tiles, shuffle, random, rackTotal } from "./tiles";
import { inspectMeld, type Meld } from "./meld";
export type Difficulty = "easy" | "normal" | "hard";
export interface Player {
  name: string;
  bot: Difficulty | null;
  rack: number[];
  melded: boolean;
}
export interface GameOptions {
  target?: 0 | 100 | 200 | 500;
  turnSeconds?: 0 | 60 | 120;
  now?: number;
}
export interface Match {
  target: number;
  round: number;
  totals: number[];
  rounds: { scores: number[]; winner: number }[];
}
export interface GameState {
  version: 1;
  seed: number;
  players: Player[];
  current: number;
  pool: number[];
  table: Meld[];
  turnStart: { table: Meld[]; rack: number[] };
  passes: number;
  phase: "playing" | "over";
  lastPlaced: number[];
  log: string[];
  turn: number;
  notice: string;
  match?: Match;
  turnSeconds?: 0 | 60 | 120;
  deadline?: number;
  history?: { table: Meld[]; rack: number[] }[];
}
export type Action = (
  | { type: "move"; ids: number[]; target: string }
  | { type: "draw" | "endTurn" | "resetTurn" | "undo" | "nextRound" }
  | { type: "sortRack"; by: "color" | "number" }
  | { type: "botTurn" | "applyPlan"; table: Meld[] }
  | { type: "tick"; now: number }
) & { at?: number };
const copy = <T>(x: T): T => structuredClone(x);
export function newGame(
  name: string,
  bots: number,
  difficulty: Difficulty,
  seed = Date.now(),
  options: GameOptions = {},
): GameState {
  const rng = random(seed),
    deck = shuffle(
      tiles.map((t) => t.id),
      rng,
    );
  const players = shuffle<Player>(
    [
      {
        name: name.trim().slice(0, 24) || "You",
        bot: null,
        rack: [],
        melded: false,
      },
      ...Array.from({ length: bots }, (_, i) => ({
        name: ["Juniper", "Atlas", "Cleo"][i],
        bot: difficulty,
        rack: [],
        melded: false,
      })),
    ],
    rng,
  );
  for (const p of players) p.rack = deck.splice(0, 14);
  return {
    version: 1,
    seed,
    players,
    current: 0,
    pool: deck,
    table: [],
    turnStart: { table: [], rack: [...players[0].rack] },
    passes: 0,
    phase: "playing",
    lastPlaced: [],
    log: ["The tiles are dealt. Let’s make a little magic."],
    turn: 1,
    notice: "",
    ...(options.target
      ? {
          match: {
            target: options.target,
            round: 1,
            totals: players.map(() => 0),
            rounds: [],
          },
        }
      : {}),
    ...(options.turnSeconds
      ? {
          turnSeconds: options.turnSeconds,
          deadline: (options.now ?? 0) + options.turnSeconds * 1000,
        }
      : {}),
  };
}
export function turnCheck(s: GameState): {
  valid: boolean;
  points: number;
  played: number[];
  reason: string;
} {
  const p = s.players[s.current],
    old = new Set(s.turnStart.table.flatMap((m) => m.tiles)),
    now = s.table.flatMap((m) => m.tiles);
  const played = s.turnStart.rack.filter((id) => now.includes(id));
  const fresh = s.table.filter((m) => !m.tiles.some((id) => old.has(id)));
  const points = fresh.reduce((n, m) => n + inspectMeld(m.tiles).points, 0);
  let reason = "";
  if (s.table.some((m) => !inspectMeld(m.tiles).valid))
    reason = "Every meld needs a valid group or run.";
  if ([...old].some((id) => !now.includes(id)))
    reason = "Table tiles must stay on the table.";
  if (
    !p.melded &&
    (s.turnStart.table.some((m) => {
      const current = s.table.find((x) => x.id === m.id);
      return (
        !current ||
        [...current.tiles].sort().join() !== [...m.tiles].sort().join()
      );
    }) ||
      points < 30)
  )
    reason = "Your opening meld must total at least 30 using only your rack.";
  // A retrieved joker must be replaced by its represented tile from the rack,
  // and reused in a valid meld during this turn.
  for (const m of s.turnStart.table) {
    const before = inspectMeld(m.tiles);
    for (const joker of m.tiles.filter((id) => tiles[id].joker)) {
      const after = s.table.find((x) => x.tiles.includes(joker));
      const unchanged =
        after &&
        m.tiles.every((id) => after.tiles.includes(id)) &&
        inspectMeld(after.tiles).values[joker] === before.values[joker] &&
        inspectMeld(after.tiles).jokerColors[joker] ===
          before.jokerColors[joker];
      if (!unchanged) {
        const replacement = played.find(
          (id) =>
            tiles[id].num === before.values[joker] &&
            tiles[id].color === before.jokerColors[joker],
        );
        if (replacement === undefined || !after)
          reason =
            "Replace a joker with its represented rack tile, then reuse it this turn.";
      }
    }
  }
  return { valid: !reason, points, played, reason };
}
function advance(
  s: GameState,
  message: string,
  passed = false,
  at = 0,
): GameState {
  s.history = [];
  s.log = [...s.log.slice(-29), message];
  s.notice = message;
  s.passes = passed ? s.passes + 1 : 0;
  if (!s.players[s.current].rack.length || s.passes >= s.players.length) {
    s.phase = "over";
    if (s.match && s.match.rounds.length < s.match.round) {
      const round = results(s);
      const scores = round.map((p) => p.score);
      s.match.totals = s.match.totals.map((n, i) => n + scores[i]);
      s.match.rounds.push({ scores, winner: round.findIndex((p) => p.winner) });
    }
    return s;
  }
  s.current = (s.current + 1) % s.players.length;
  s.turn++;
  if (s.turnSeconds) s.deadline = at + s.turnSeconds * 1000;
  s.turnStart = { table: copy(s.table), rack: [...s.players[s.current].rack] };
  return s;
}
export function reducer(state: GameState, action: Action): GameState {
  if (action.type === "nextRound") return nextRound(state, action.at ?? 0);
  if (state.phase === "over") return state;
  if (action.type === "tick") {
    if (!state.turnSeconds || !state.deadline || action.now < state.deadline)
      return state;
    const next = reducer(state, { type: "draw", at: action.now });
    next.notice = `Time’s up. ${next.notice}`;
    return next;
  }
  const s = copy(state),
    p = s.players[s.current];
  s.notice = "";
  if (action.type === "undo") {
    const previous = s.history?.pop();
    if (!previous) return state;
    s.table = previous.table;
    p.rack = previous.rack;
    s.notice = "Undid the last move.";
    return s;
  }
  if (action.type === "sortRack") {
    p.rack.sort((a, b) =>
      action.by === "number"
        ? tiles[a].num - tiles[b].num || a - b
        : (tiles[a].color ?? "z").localeCompare(tiles[b].color ?? "z") ||
          tiles[a].num - tiles[b].num,
    );
    return s;
  }
  if (action.type === "resetTurn") {
    s.history = [];
    s.table = copy(s.turnStart.table);
    p.rack = [...s.turnStart.rack];
    return s;
  }
  if (action.type === "move") {
    const ids = [...new Set(action.ids)],
      tableIds = new Set(s.table.flatMap((m) => m.tiles)),
      old = new Set(s.turnStart.table.flatMap((m) => m.tiles));
    if (
      !ids.length ||
      ids.some((id) => !p.rack.includes(id) && !tableIds.has(id))
    )
      return state;
    if (!p.melded && ids.some((id) => old.has(id)))
      return {
        ...state,
        notice: "Open with 30 points before rearranging table tiles.",
      };
    if (!p.melded && s.turnStart.table.some((m) => m.id === action.target))
      return {
        ...state,
        notice: "Your opening meld must come entirely from your rack.",
      };
    if (action.target === "rack" && ids.some((id) => old.has(id)))
      return { ...state, notice: "Table tiles cannot return to your rack." };
    s.history = [
      ...(s.history ?? []).slice(-99),
      { table: copy(s.table), rack: [...p.rack] },
    ];
    p.rack = p.rack.filter((id) => !ids.includes(id));
    for (const m of s.table)
      m.tiles = m.tiles.filter((id) => !ids.includes(id));
    if (action.target === "rack") p.rack.push(...ids);
    else {
      let m = s.table.find((m) => m.id === action.target);
      if (!m) {
        m = { id: `m-${s.turn}-${s.table.length}-${ids[0]}`, tiles: [] };
        s.table.push(m);
      }
      m.tiles.push(...ids);
    }
    s.table = s.table.filter((m) => m.tiles.length);
    return s;
  }
  if (action.type === "draw") {
    s.table = copy(s.turnStart.table);
    p.rack = [...s.turnStart.rack];
    const tile = s.pool.shift();
    if (tile !== undefined) p.rack.push(tile);
    s.lastPlaced = [];
    return advance(
      s,
      `${p.name} ${tile === undefined ? "passed" : "drew a tile"}.`,
      tile === undefined,
      action.at ?? 0,
    );
  }
  if (action.type === "botTurn" || action.type === "applyPlan") {
    // Accept only conserved submissions, then use the exact human validator.
    const ids = action.table.flatMap((m) => m.tiles),
      available = [...s.table.flatMap((m) => m.tiles), ...p.rack];
    if (
      new Set(ids).size !== ids.length ||
      ids.some((id) => !available.includes(id))
    )
      return action.type === "applyPlan"
        ? state
        : reducer(state, { type: "draw", at: action.at });
    if (
      action.type === "applyPlan" &&
      s.table.flatMap((m) => m.tiles).some((id) => !ids.includes(id))
    )
      return state;
    if (action.type === "applyPlan")
      s.history = [
        ...(s.history ?? []).slice(-99),
        { table: copy(s.table), rack: [...p.rack] },
      ];
    s.table = copy(action.table);
    s.history = [
      ...(s.history ?? []).slice(-99),
      { table: copy(s.table), rack: [...p.rack] },
    ];
    p.rack = p.rack.filter((id) => !ids.includes(id));
    if (!turnCheck(s).valid || !turnCheck(s).played.length)
      return action.type === "applyPlan"
        ? state
        : reducer(state, { type: "draw", at: action.at });
  }
  if (action.type === "applyPlan") return s;
  const check = turnCheck(s);
  if (
    !check.played.length &&
    JSON.stringify(s.table) === JSON.stringify(s.turnStart.table)
  )
    return {
      ...state,
      notice: "Play at least one rack tile, or draw to end your turn.",
    };
  if (!check.valid) {
    s.table = copy(s.turnStart.table);
    p.rack = [...s.turnStart.rack, ...s.pool.splice(0, 3)];
    s.lastPlaced = [];
    return advance(
      s,
      `${p.name}: invalid turn — ${check.reason} Drew penalty tiles.`,
      false,
      action.at ?? 0,
    );
  }
  if (!check.played.length)
    return {
      ...state,
      notice: "Play at least one rack tile, or draw to end your turn.",
    };
  p.melded = true;
  s.lastPlaced = check.played;
  return advance(
    s,
    `${p.name} played ${check.played.length} tile${check.played.length === 1 ? "" : "s"}.`,
    false,
    action.at ?? 0,
  );
}
export function results(s: GameState) {
  const totals = s.players.map((p) => rackTotal(p.rack)),
    winner = totals.indexOf(Math.min(...totals));
  return s.players.map((p, i) => ({
    ...p,
    total: totals[i],
    winner: i === winner,
    score:
      i === winner
        ? totals.reduce((n, v, j) => n + (j === i ? 0 : v), 0)
        : -totals[i],
  }));
}

export function matchWinner(s: GameState): number | null {
  if (!s.match) return null;
  const top = Math.max(...s.match.totals),
    leaders = s.match.totals
      .map((n, i) => (n === top ? i : -1))
      .filter((i) => i >= 0);
  return top >= s.match.target && leaders.length === 1 ? leaders[0] : null;
}
function nextRound(s: GameState, at: number): GameState {
  if (s.phase !== "over" || !s.match || matchWinner(s) !== null) return s;
  const round = s.match.round + 1,
    deck = shuffle(
      tiles.map((t) => t.id),
      random(s.seed + round * 7919),
    );
  const players = s.players.map((p) => ({
    ...p,
    rack: deck.splice(0, 14),
    melded: false,
  }));
  const current = (round - 1) % players.length;
  return {
    ...s,
    players,
    current,
    pool: deck,
    table: [],
    turnStart: { table: [], rack: [...players[current].rack] },
    passes: 0,
    phase: "playing",
    lastPlaced: [],
    log: [`Round ${round}: first to ${s.match.target} points wins the match.`],
    turn: 1,
    notice: "",
    history: [],
    match: { ...s.match, round },
    ...(s.turnSeconds ? { deadline: at + s.turnSeconds * 1000 } : {}),
  };
}
