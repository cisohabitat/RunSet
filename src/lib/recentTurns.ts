import type { GameState } from "../engine/game";
import { inspectMeld, type Meld } from "../engine/meld";
export interface PublicTurn {
  turn: number;
  actor: string;
  before: Meld[];
  after: Meld[];
  added: number[];
}
const board = (table: Meld[]) => {
  const ids = table.flatMap((m) => m.tiles);
  return (
    ids.length <= 106 &&
    new Set(ids).size === ids.length &&
    ids.every((id) => Number.isInteger(id) && id >= 0 && id < 106) &&
    table.every((m) => inspectMeld(m.tiles).valid)
  );
};
/** Only public completed boards. No racks, pool IDs, clocks, scores or logs. */
export function publicTurn(
  before: GameState,
  after: GameState,
): PublicTurn | null {
  if (
    before === after ||
    before.seed !== after.seed ||
    before.phase !== "playing" ||
    !(
      after.turn === before.turn + 1 ||
      (after.phase === "over" && after.turn === before.turn)
    ) ||
    (after.phase === "playing" &&
      after.current !== (before.current + 1) % before.players.length) ||
    !board(before.turnStart.table) ||
    !board(after.table)
  )
    return null;
  const old = new Set(before.turnStart.table.flatMap((m) => m.tiles));
  return {
    turn: before.turn,
    actor: before.players[before.current].name,
    before: structuredClone(before.turnStart.table),
    after: structuredClone(after.table),
    added: after.table.flatMap((m) => m.tiles).filter((id) => !old.has(id)),
  };
}
let previous: { game: GameState; epoch: number } | null = null;
let frames: PublicTurn[] = [];
export function observeTurns(game: GameState, epoch: number) {
  if (
    !previous ||
    previous.epoch !== epoch ||
    previous.game.seed !== game.seed ||
    game.turn < previous.game.turn
  ) {
    frames = [];
    previous = { game, epoch };
    return;
  }
  const frame = publicTurn(previous.game, game);
  if (frame) frames = [...frames, frame].slice(-6);
  else if (game.turn !== previous.game.turn) frames = [];
  previous = { game, epoch };
}
export function recentTurns(game: GameState, epoch: number): PublicTurn[] {
  return previous?.epoch === epoch && previous.game.seed === game.seed
    ? frames
    : [];
}
