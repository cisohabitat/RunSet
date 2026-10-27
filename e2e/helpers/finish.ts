import { newGame, reducer } from "../../src/engine/game";
export function jokerFinish() {
  let game = newGame("Pass", 1, "easy", 4321);
  game.players.sort((a, b) => Number(!!a.bot) - Number(!!b.bot));
  game.players[0].rack = [104, 12];
  game.players[0].melded = true;
  game.players[1].rack = [9, 35, 61];
  game.current = 1;
  game.table = [];
  const used = new Set([104, 12, 9, 35, 61]);
  game.pool = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => !used.has(id),
  );
  game.turnStart = { table: [], rack: [9, 35, 61] };
  game = reducer(game, {
    type: "botTurn",
    table: [{ id: "finish", tiles: [9, 35, 61] }],
  });
  return game;
}
