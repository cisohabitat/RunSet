import { crowdedBorrow } from "./endgame-fixtures";
import { type GameState } from "../src/engine/game";

export function fourPlayerMatch(seed = 81001): GameState {
  const s = crowdedBorrow();
  s.seed = seed;
  const rest = [...s.players[1].rack];
  s.players = [
    { ...s.players[0], name: "constructor", bot: null },
    { name: "Pass", bot: "easy", rack: rest.splice(0, 2), melded: true },
    { name: "电脑一", bot: "easy", rack: rest.splice(0, 3), melded: true },
    { name: "red 7", bot: "easy", rack: rest, melded: true },
  ];
  s.match = { target: 200, round: 1, totals: [0, 0, 0, 0], rounds: [] };
  s.coach = false;
  return s;
}

/** Score arithmetic kept independent of engine results/rackTotal for the audit. */
export function expectedRound(s: GameState) {
  const remaining = s.players.map((p) =>
    p.rack.reduce((sum, id) => sum + (id >= 104 ? 30 : (id % 13) + 1), 0),
  );
  const winner = remaining.indexOf(Math.min(...remaining));
  return {
    winner,
    scores: remaining.map((points, i) =>
      i === winner
        ? remaining.reduce((sum, n, j) => sum + (j === i ? 0 : n), 0)
        : -points,
    ),
  };
}
