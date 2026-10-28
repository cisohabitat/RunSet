import { expect, it } from "vitest";
import { reducer } from "../engine/game";
import { freshTurnPractice, practiceResumeMessage } from "./turnPractice";
import {
  profileTime,
  profileChoice,
  wholePracticeSummary,
} from "./profileSummary";
it("describes actual empty, unfinished, ready and completed practice without changing it", () => {
  const empty = freshTurnPractice(),
    before = JSON.stringify(empty);
  expect(practiceResumeMessage(empty)).toContain("goal below");
  const partial = {
    ...empty,
    game: reducer(empty.game, { type: "move", ids: [9], target: "new" }),
  };
  expect(practiceResumeMessage(partial)).toContain("unfinished practice tiles");
  const ready = {
    ...empty,
    game: reducer(empty.game, {
      type: "move",
      ids: [9, 35, 61],
      target: "new",
    }),
  };
  expect(practiceResumeMessage(ready)).toContain("ready to finish");
  expect(
    practiceResumeMessage({
      ...ready,
      game: reducer(ready.game, { type: "endTurn" }),
    }),
  ).toContain("completed practice");
  expect(
    practiceResumeMessage({
      ...empty,
      game: reducer(empty.game, { type: "draw" }),
    }),
  ).toContain("ended with a draw");
  expect(JSON.stringify(empty)).toBe(before);
});
it("summarises valid imported layouts and safely handles missing or unreadable context", () => {
  const record = freshTurnPractice("quiet", "你", "joker", 3).record;
  expect(wholePracticeSummary(JSON.stringify(record))).toMatchObject({
    title: "A whole turn with a joker",
    layout: 4,
    mode: "FEWER PROMPTS",
  });
  expect(wholePracticeSummary("{bad")).toBeNull();
  expect(wholePracticeSummary(null)).toBeNull();
  expect(profileTime(1e300, "en")).toBeNull();
  expect(profileTime("bad", "en")).toBeNull();
  expect(profileTime(1700000000000, "zh-CN")).not.toBeNull();
});
it("shows meaningful choice values including muted sound without exposing storage details", () => {
  expect(profileChoice("runset.tableOrder.v1", "colour")).toBe(
    "Colour then number",
  );
  expect(profileChoice("runset.tableOrder.v1", "invalid")).toBe("Unavailable");
  expect(profileChoice("runset.tableOrder.v1", "constructor")).toBe(
    "Unavailable",
  );
  expect(profileChoice("runset.tableOrder.v1", "__proto__")).toBe(
    "Unavailable",
  );
  expect(profileChoice("runset.muted", "true")).toBe("Off");
  expect(profileChoice("runset.muted", "false")).toBe("On");
  expect(profileChoice("runset.language", "zh-CN")).toBe("简体中文");
  expect(profileChoice("runset.reading", null)).toBe("Not saved");
  expect(profileChoice("runset.pace", "5000")).toContain("Unhurried");
});

it("labels only supported theme choices", () => {
  expect(profileChoice("runset.theme", "dark")).toBe("Dark");
  expect(profileChoice("runset.theme", "system")).toBe("Follow device");
  expect(profileChoice("runset.theme", "constructor")).toBe("Unavailable");
  expect(profileChoice("runset.theme", "__proto__")).toBe("Unavailable");
});
