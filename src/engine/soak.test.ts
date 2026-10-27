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
