import { describe, it, expect } from "vitest";
import { newGame, type Difficulty } from "./game";
import { botTurn, planBot } from "./bot";
import { inspectMeld } from "./meld";
import { rackPlan, repartition } from "./solver";
import { conserved, fixture } from "./test-helpers";
describe("search", () => {
  it("finds a 30-point opening and both copies of duplicate melds", () => {
    expect(rackPlan([9, 35, 61], true).points).toBe(30);
    expect(rackPlan([0, 1, 2, 13, 14, 15], false).used).toHaveLength(6);
    expect(rackPlan([0, 1, 26, 27, 104, 105], false).used).toHaveLength(6);
  });
  it("normal extends melds while easy only makes new ones", () => {
    const s = fixture([3, 20], [{ id: "run", tiles: [0, 1, 2] }], true);
    s.players[s.current].bot = "easy";
    expect(planBot(s).flatMap((m) => m.tiles)).not.toContain(3);
    s.players[s.current].bot = "normal";
    expect(planBot(s).flatMap((m) => m.tiles)).toContain(3);
  });
  it("can re-partition a table to split a run for a rack tile", () => {
    const plan = repartition([{ id: "run", tiles: [0, 1, 2, 3, 4] }], [5], 300);
    expect(plan?.flatMap((m) => m.tiles).length).toBe(6);
    expect(plan?.every((m) => inspectMeld(m.tiles).valid)).toBe(true);
  });
  it("keeps hard planning inside the 400ms search budget on a populated table", () => {
    const s = fixture(
      [9, 22, 35, 48, 61, 74, 87, 100],
      [{ id: "r", tiles: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
      true,
    );
    s.players[s.current].bot = "hard";
    const started = performance.now();
    planBot(s);
    expect(performance.now() - started).toBeLessThan(450);
  });
});
describe("bot simulations", () => {
  for (const difficulty of ["easy", "normal", "hard"] as Difficulty[])
    it(`${difficulty} finishes legal, conserved games across seeded deals`, () => {
      let moves = 0;
      for (let seed = 1; seed <= (difficulty === "hard" ? 8 : 18); seed++) {
        let s = newGame("Simulation", (seed % 3) + 1, difficulty, seed);
        s.players.forEach((p) => (p.bot = difficulty));
        while (s.phase === "playing" && moves < 15000) {
          s = botTurn(s, 40);
          moves++;
          conserved(s);
          expect(s.table.every((m) => inspectMeld(m.tiles).valid)).toBe(true);
        }
        expect(s.phase).toBe("over");
      }
      expect(moves).toBeGreaterThan(100);
      console.log(`${difficulty}: ${moves} legal moves simulated`);
    }, 120000);
});
