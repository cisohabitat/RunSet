import { expect, it } from "vitest";
import { practiceGame } from "../engine/practice";
import { reducer } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import { moveHelp } from "./moveHelp";
it("explains an actual blocked attempt and does not accept inherited reason keys", () => {
  const base = practiceGame("rearrange"),
    blocked = reducer(base, { type: "move", ids: [0], target: "rack" });
  expect(moveHelp(blocked, [0])).toMatchObject({
    kind: "blocked",
    ids: [0],
    reason: blocked.notice,
    next: "Choose a group/run on the table as the destination.",
  });
  expect(moveHelp({ ...base, notice: "constructor" }, [0])).toBeNull();
  const unopened = practiceGame("rearrange");
  unopened.players[0].melded = false;
  const wrongTarget = reducer(unopened, {
    type: "move",
    ids: [5],
    target: "practice-run",
  });
  expect(moveHelp(wrongTarget, [5])?.next).toBe(
    "Choose New group or run for your opening.",
  );
});
it("shows one actual rack tile that the reducer can add without mutating the draft", () => {
  const s = reducer(practiceGame(), {
      type: "move",
      ids: [0, 1],
      target: "new",
    }),
    before = JSON.stringify(s),
    help = moveHelp(s)!;
  expect(help.ids).toEqual([0, 1]);
  expect(help.candidate).toBe(2);
  const trial = reducer(s, {
    type: "move",
    ids: [help.candidate!],
    target: s.table[0].id,
  });
  expect(inspectMeld(trial.table[0].tiles).valid).toBe(true);
  expect(JSON.stringify(s)).toBe(before);
});
it("explains missing opening points and safely restores a retrieved joker", () => {
  const opening = reducer(practiceGame(), {
    type: "move",
    ids: [0, 1, 2],
    target: "new",
  });
  expect(moveHelp(opening)?.next).toBe(
    "Add at least 24 more opening points using tiles from your rack.",
  );
  const wild = reducer(practiceGame("jokers"), {
    type: "move",
    ids: [104],
    target: "new",
  });
  expect(moveHelp(wild)).toMatchObject({
    ids: [104],
    next: "Use Reset to restore the joker, then replace it with the matching rack tile.",
  });
});
it("says Pass when no tiles remain rather than suggesting an unavailable draw", () => {
  const s = practiceGame("rearrange");
  s.players[1].rack.push(...s.pool.splice(0));
  const blocked = reducer(s, { type: "endTurn" });
  expect(moveHelp(blocked)).toMatchObject({
    ids: [],
    next: "Choose Pass to restore unfinished edits and end your turn.",
  });
});
