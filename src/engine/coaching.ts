import { tiles } from "./tiles";
import { inspectMeld, type Meld } from "./meld";
import { type GameState, turnCheck } from "./game";
import { rackPlan } from "./solver";
import { planBot } from "./bot";
export function explainMeld(ids: number[]): string {
  const info = inspectMeld(ids);
  if (info.valid)
    return `${info.kind === "group" ? "Matching-number group" : "Consecutive same-colour run"} worth ${info.points} points.`;
  if (ids.length < 3)
    return `Add ${3 - ids.length} more tile${ids.length === 2 ? "" : "s"}: a group or run needs at least three.`;
  const natural = ids.filter((id) => !tiles[id].joker);
  if (
    natural.length &&
    natural.every((id) => tiles[id].num === tiles[natural[0]].num)
  ) {
    const repeated = natural.find((id, i) =>
      natural
        .slice(0, i)
        .some((other) => tiles[id].color === tiles[other].color),
    );
    return repeated !== undefined
      ? `This group repeats ${tiles[repeated].color}. Use one tile of each colour, up to four.`
      : "A group has three or four matching numbers in different colours.";
  }
  if (
    natural.length &&
    natural.every((id) => tiles[id].color === tiles[natural[0]].color)
  ) {
    const nums = natural.map((id) => tiles[id].num).sort((a, b) => a - b);
    if (new Set(nums).size !== nums.length)
      return "A run cannot repeat a number. Return the duplicate or use it in a different group or run.";
    const missing = Array.from(
      { length: nums.at(-1)! - nums[0] + 1 },
      (_, i) => nums[0] + i,
    ).filter((n) => !nums.includes(n));
    if (missing.length)
      return `This run is missing ${missing.join(", ")}. Fill the gap with the same colour or a joker; 13 never wraps to 1.`;
  }
  return "Choose either matching numbers in different colours, or consecutive numbers in one colour. Split these tiles into separate groups or runs.";
}
export interface Hint {
  table: Meld[] | null;
  used: number[];
  message: string;
  explanations?: string[];
}
export function planHint(s: GameState): Hint {
  const p = s.players[s.current],
    check = turnCheck(s);
  if (p.bot)
    return {
      table: null,
      used: [],
      message: "Wait for your turn to request a move.",
    };
  const invalid = s.table.find((m) => !inspectMeld(m.tiles).valid);
  if (invalid)
    return {
      table: null,
      used: [],
      message: `Fix the incomplete table first. ${explainMeld(invalid.tiles)} Your edits are unchanged.`,
    };
  if (check.valid && check.played.length)
    return {
      table: null,
      used: [],
      message:
        "Your table is valid and you played from your rack. You can End turn now, or keep playing.",
    };
  const safe = structuredClone(s);
  safe.players.forEach((x, i) => {
    if (i !== s.current) x.rack = [];
  });
  // Hints may rearrange, independently of the opponent difficulty.
  if (p.melded) safe.players[s.current].bot = "hard";
  const table = p.melded
    ? planBot(safe, 300)
    : [
        ...s.table,
        ...rackPlan(p.rack, true).melds.map((tiles, i) => ({
          id: `hint-${s.turn}-${i}`,
          tiles,
        })),
      ];
  const trial = {
      ...s,
      table,
      players: s.players.map((x, i) =>
        i === s.current
          ? {
              ...x,
              rack: x.rack.filter(
                (id) => !table.some((m) => m.tiles.includes(id)),
              ),
            }
          : x,
      ),
    },
    validation = turnCheck(trial);
  const used = p.rack.filter((id) => table.some((m) => m.tiles.includes(id)));
  if (!validation.valid || !used.length)
    return {
      table: null,
      used: [],
      message: p.melded
        ? `No legal addition was found in this search. ${s.pool.length ? "You can draw" : "The pool is empty; you can pass"}; unfinished edits will be reset.`
        : `No opening reaching 30 points was found. ${s.pool.length ? "You can draw and try on your next turn" : "The pool is empty; you can pass"}. Your current opening is worth ${check.points} points.`,
    };
  const explanations = table
    .filter((m) => m.tiles.some((id) => used.includes(id)))
    .map((m) => {
      const info = inspectMeld(m.tiles),
        numbers = info.ordered.map((id) => info.values[id]);
      const natural = m.tiles.find((id) => !tiles[id].joker);
      return info.kind === "group"
        ? `Group: ${numbers.length} tiles showing ${numbers[0]}, each with a different colour.`
        : `Run: ${natural === undefined ? "one colour" : tiles[natural].color} ${numbers.join("–")}, consecutive without gaps.`;
    });
  explanations.push(
    p.melded
      ? "You have already opened, so there is no minimum point total this turn."
      : `Opening total: ${validation.points} points, meeting the 30-point requirement.`,
  );
  return {
    table,
    used,
    explanations,
    message: `Possible move: play ${used.length} highlighted tile${used.length === 1 ? "" : "s"}${p.melded ? "" : ` for an opening worth ${validation.points} points`}. Review it, then choose Place hint if you want to use it. Your turn will not end automatically.`,
  };
}
export function narrateMove(s: GameState): string {
  if (!s.lastPlaced.length) return s.notice;
  const affected = s.table.filter((m) =>
    m.tiles.some((id) => s.lastPlaced.includes(id)),
  );
  const detail = affected
    .map((m) => {
      const info = inspectMeld(m.tiles);
      const count = m.tiles.filter((id) => s.lastPlaced.includes(id)).length;
      return `${count === m.tiles.length ? "made" : "added to"} a ${info.kind === "group" ? "matching-number group" : "same-colour run"} (${info.ordered.map((id) => info.values[id]).join(", ")})`;
    })
    .join("; ");
  return `${s.notice} They ${detail}.`;
}
