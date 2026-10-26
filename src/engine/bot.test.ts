import { describe, it, expect } from "vitest";
import {
  newGame,
  reducer,
  turnCheck,
  type Difficulty,
  type GameState,
} from "./game";
import { planBot } from "./bot";
import { inspectMeld } from "./meld";
import { rackPlan, repartition } from "./solver";
import { conserved, fixture } from "./test-helpers";
import { readFileSync } from "node:fs";
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
  it("continues to an accepted partition after rejecting an equally sized candidate", () => {
    let rejected = 0;
    const plan = repartition(
      [{ id: "run", tiles: [0, 1, 2, 3, 4] }],
      [5],
      100,
      (candidate) => {
        if (candidate.length === 1) {
          rejected++;
          return false;
        }
        return true;
      },
    );
    expect(rejected).toBeGreaterThan(0);
    expect(plan).toHaveLength(2);
    expect(plan!.flatMap((m) => m.tiles)).toHaveLength(6);
  });
  it("keeps hard planning inside the 400ms search budget on a populated table", () => {
    const s = JSON.parse(readFileSync("docs/DIFFICULTY_MIXED.json", "utf8"))
      .rejectionExamples[0].state as GameState;
    s.players[s.current].bot = "hard";
    const started = performance.now();
    planBot(s);
    expect(performance.now() - started).toBeLessThan(400);
  });
  it("keeps the recorded legal black 9 alternative when a joker extension is rejected", () => {
    const example = JSON.parse(
      readFileSync("docs/DIFFICULTY_MIXED.json", "utf8"),
    ).rejectionExamples[0];
    for (const level of ["normal", "hard"] as const) {
      const s = structuredClone(example.state) as GameState;
      s.players[s.current].bot = level;
      const before = JSON.stringify(s),
        table = planBot(s, 40);
      if (level === "normal")
        expect(table.flatMap((m) => m.tiles)).toContain(86);
      expect(
        table
          .flatMap((m) => m.tiles)
          .some((id) => s.players[s.current].rack.includes(id)),
      ).toBe(true);
      const draft = reducer(s, { type: "applyPlan", table });
      expect(draft).not.toBe(s);
      expect(turnCheck(draft).valid).toBe(true);
      conserved(draft);
      expect(JSON.stringify(s)).toBe(before);
    }
  });
  it("skips an illegal first destination and finds a legal destination for the same tile", () => {
    const s = fixture(
      [1],
      [
        { id: "joker-run", tiles: [3, 4, 5, 104] },
        { id: "other-run", tiles: [2, 16, 17] },
      ],
      true,
    );
    s.players[s.current].bot = "normal";
    const table = planBot(s),
      draft = reducer(s, { type: "applyPlan", table });
    expect(table.find((m) => m.id === "other-run")!.tiles).toContain(1);
    expect(turnCheck(draft).valid).toBe(true);
    expect(draft).not.toBe(s);
  });
  it("does not repartition after a legal rack-empty baseline", () => {
    const s = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], true);
    s.players[s.current].bot = "hard";
    const started = performance.now(),
      table = planBot(s);
    expect(performance.now() - started).toBeLessThan(100);
    expect(
      reducer(s, { type: "applyPlan", table }).players[s.current].rack,
    ).toHaveLength(0);
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
          const table = planBot(s, 40),
            used = table.some((m) =>
              m.tiles.some((id) => s.players[s.current].rack.includes(id)),
            );
          if (used) {
            const draft = reducer(s, { type: "applyPlan", table });
            expect(draft).not.toBe(s);
            expect(turnCheck(draft).valid).toBe(true);
          }
          s = reducer(s, { type: "botTurn", table });
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
