import { expect, it } from "vitest";
import { newGame, reducer, matchWinner } from "./game";
import { planBot } from "./bot";
import { validSave } from "../lib/storage";
import { exportBackup, importBackup } from "../lib/backup";
import { conserved } from "./test-helpers";
it("keeps long matches and repeated backup round trips valid over 1000 turns", () => {
  let seed = 901,
    s = newGame("Soak", 3, "easy", seed, { target: 500, coach: false }),
    rounds = 1;
  for (let turn = 0; turn < 1000; turn++) {
    if (s.phase === "over") {
      s =
        s.match && matchWinner(s) === null
          ? reducer(s, { type: "nextRound" })
          : newGame("Soak", 3, "easy", ++seed, { target: 500, coach: false });
      rounds++;
    }
    const snapshot = JSON.stringify(s),
      table = planBot(s, 10);
    expect(JSON.stringify(s)).toBe(snapshot);
    s = reducer(s, { type: "botTurn", table });
    conserved(s);
    expect(validSave(s)).toBe(true);
    if (turn % 100 === 0) expect(importBackup(exportBackup(s))).toEqual(s);
  }
  expect(rounds).toBeGreaterThan(3);
  console.log(
    `Soak: 1000 conserved turns across ${rounds} rounds; ten backup round trips.`,
  );
}, 20000);

it("preserves complete matches and backups over 5000 additional timed and untimed turns", () => {
  let turns = 0, rounds = 0, backups = 0;
  for (const opponents of [1, 3]) {
    let seed = 2901 + opponents;
    let s = newGame("长局玩家", opponents, "easy", seed, { target: 500, coach: false, turnSeconds: opponents === 3 ? 60 : undefined });
    for (let n = 0; n < 2500; n++) {
      if (s.phase === "over") {
        s = s.match && matchWinner(s) === null ? reducer(s, { type: "nextRound", at: 100000 + turns * 100 }) : newGame("长局玩家", opponents, "easy", ++seed, { target: 500, coach: false, turnSeconds: opponents === 3 ? 60 : undefined });
        rounds++;
      }
      const before = JSON.stringify(s);
      const table = planBot(s, 5);
      expect(JSON.stringify(s)).toBe(before);
      s = reducer(s, { type: "botTurn", table, at: s.deadline ? s.deadline - 1 : undefined });
      conserved(s);
      expect(validSave(s), `opponents ${opponents}, turn ${n}`).toBe(true);
      if (n % 25 === 0) {
        s = importBackup(exportBackup(s));
        backups++;
      }
      turns++;
    }
  }
  expect(turns).toBe(5000);
  expect(backups).toBe(200);
  expect(rounds).toBeGreaterThan(20);
  console.log(JSON.stringify({ cycle: "everyday-play", turns, rounds, backups, opponents: [1, 3], strategy: "easy", plannerBudgetMs: 5, physicalDevice: false }));
}, 30000);
