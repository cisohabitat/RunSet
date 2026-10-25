import { it, expect } from "vitest";
import { exportBackup, importBackup, MAX_BACKUP_BYTES } from "./backup";
import { practiceGame } from "../engine/practice";
import { reducer } from "../engine/game";
it("round trips a half-finished position and undo history without changing it", () => {
  const s = reducer(practiceGame(), {
    type: "move",
    ids: [9, 35, 61],
    target: "new",
  });
  const restored = importBackup(exportBackup(s));
  expect(restored).toEqual(s);
  expect(restored).not.toBe(s);
});
it("rejects malformed, old, oversized and incomplete backups", () => {
  for (const raw of [
    "{",
    "null",
    JSON.stringify({
      format: "runset-backup",
      version: 0,
      game: practiceGame(),
    }),
    JSON.stringify({
      format: "runset-backup",
      version: 1,
      game: { ...practiceGame(), pool: [] },
    }),
    " ".repeat(MAX_BACKUP_BYTES + 1),
  ])
    expect(() => importBackup(raw)).toThrow();
});
it("never evaluates executable text or accepts raw unversioned data", () => {
  expect(() => importBackup("alert(1)")).toThrow();
  expect(() => importBackup(JSON.stringify(practiceGame()))).toThrow();
});

it("rejects malformed visible state instead of importing a position that crashes rendering", () => {
  const s = { ...practiceGame(), notice: { unexpected: true } };
  expect(() =>
    importBackup(
      JSON.stringify({ format: "runset-backup", version: 1, game: s }),
    ),
  ).toThrow();
});
