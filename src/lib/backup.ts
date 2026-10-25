import type { GameState } from "../engine/game";
import { validSave } from "./storage";
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
export function exportBackup(game: GameState): string {
  if (!validSave(game))
    throw Error("This position could not be validated for export.");
  return JSON.stringify(
    {
      format: "runset-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      game,
    },
    null,
    2,
  );
}
export function importBackup(raw: string): GameState {
  if (raw.length > MAX_BACKUP_BYTES)
    throw Error(
      "This backup is too large. Choose a RunSet JSON file smaller than 2 MB.",
    );
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw Error(
      "This file is not readable JSON. Your current game is unchanged.",
    );
  }
  try {
    const v = value as { format?: string; version?: number; game?: unknown };
    if (v?.format === "runset-backup" && v.version === 1 && validSave(v.game))
      return structuredClone(v.game);
  } catch {
    /* Malformed data must not replace the current game. */
  }
  throw Error(
    "This is not a supported, complete RunSet backup. Your current game is unchanged.",
  );
}
