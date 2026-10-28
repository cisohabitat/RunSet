import type { GameState } from "../engine/game";
import {
  exerciseGame,
  exerciseKinds,
  exerciseComplete,
} from "../engine/exercises";
import { validDaily } from "./dailyPuzzle";
import { validSolo } from "./soloProgress";
import { decodeRackOrder } from "./rackOrder";
import { replayTurnPractice } from "./turnPractice";
import { validSave } from "./storage";
import { MAX_BACKUP_BYTES } from "./backup";
export const profileBooleanKeys = [
  "runset.reading",
  "runset.contrast",
  "runset.largeTiles",
  "runset.simpleHome",
  "runset.learning",
  "runset.narrate",
  "runset.muted",
  "runset.tableExpanded",
] as const;
export const profileLearningKeys = [
  "runset.practice.v1",
  "runset.exercises.v1",
  "runset.solo.v1",
  "runset.turnPractice.v1",
] as const;
export const profileKeys = [
  ...profileBooleanKeys,
  ...profileLearningKeys,
  "runset.theme",
  "runset.language",
  "runset.pace",
  "runset.audioVoice",
  "runset.rackOrder.v1",
  "runset.tableOrder.v1",
] as const;
export interface PortableProfile {
  format: "runset-profile";
  version: 1;
  exportedAt: string;
  game: GameState | null;
  values: Record<string, string>;
}
export function validProfileValue(key: string, raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length > MAX_BACKUP_BYTES) return false;
  if ((profileBooleanKeys as readonly string[]).includes(key))
    return raw === "true" || raw === "false";
  if (key === "runset.theme") return ["system", "light", "dark"].includes(raw);
  if (key === "runset.language") return raw === "en" || raw === "zh-CN";
  if (key === "runset.pace")
    return ["700", "1400", "2400", "5000"].includes(raw);
  if (key === "runset.audioVoice") return ["device", "recorded"].includes(raw);
  if (key === "runset.tableOrder.v1")
    return ["placed", "kind", "colour"].includes(raw);
  if (key === "runset.rackOrder.v1") return !!decodeRackOrder(raw);
  if (!(profileLearningKeys as readonly string[]).includes(key)) return false;
  try {
    const p = JSON.parse(raw);
    if (key === "runset.turnPractice.v1")
      return raw.length <= 65536 && !!replayTurnPractice(p);
    if (key === "runset.solo.v1") return validSolo(p);
    if (
      !p ||
      !validSave(p.game) ||
      p.game.players.length !== 2 ||
      p.game.players[0].bot !== null ||
      p.game.turnSeconds ||
      p.game.match
    )
      return false;
    if (key === "runset.practice.v1")
      return (
        ["basics", "jokers", "rearrange"].includes(p.lesson) &&
        Number.isInteger(p.step) &&
        p.step >= 0 &&
        p.step <= 7 &&
        p.game.seed === 4321
      );
    return (
      p.version === 1 &&
      exerciseKinds.includes(p.kind) &&
      typeof p.checked === "boolean" &&
      p.game.current === 0 &&
      p.game.turn === 1 &&
      p.game.phase === "playing" &&
      JSON.stringify(p.game.turnStart) ===
        JSON.stringify(exerciseGame(p.kind, p.game.seed).turnStart) &&
      (!p.checked || exerciseComplete(p.kind, p.game)) &&
      (p.dailyDate === undefined ||
        validDaily(p.dailyDate, p.kind, p.game.seed))
    );
  } catch {
    return false;
  }
}
export function importProfile(raw: string): PortableProfile {
  if (
    raw.length > MAX_BACKUP_BYTES ||
    new TextEncoder().encode(raw).byteLength > MAX_BACKUP_BYTES
  )
    throw Error("Choose a RunSet profile file smaller than 2 MB.");
  try {
    const p = JSON.parse(raw);
    if (
      p?.format !== "runset-profile" ||
      p.version !== 1 ||
      typeof p.exportedAt !== "string" ||
      p.exportedAt.length > 64 ||
      !Number.isFinite(Date.parse(p.exportedAt)) ||
      (p.game !== null && !validSave(p.game)) ||
      !p.values ||
      Array.isArray(p.values) ||
      typeof p.values !== "object" ||
      Object.keys(p.values).length > profileKeys.length
    )
      throw Error();
    for (const [key, value] of Object.entries(p.values))
      if (
        !(profileKeys as readonly string[]).includes(key) ||
        !validProfileValue(key, value)
      )
        throw Error();
    return {
      format: "runset-profile",
      version: 1,
      exportedAt: p.exportedAt,
      game: p.game === null ? null : structuredClone(p.game),
      values: { ...p.values },
    };
  } catch {
    throw Error(
      "This is not a supported, complete RunSet profile. Nothing has been imported.",
    );
  }
}
export function exportProfile(
  game: GameState | null,
  storage: Pick<Storage, "getItem">,
): string {
  const values: Record<string, string> = {};
  for (const key of profileKeys) {
    let raw: string | null;
    try {
      raw = storage.getItem(key);
    } catch {
      throw Error("The profile could not be exported.");
    }
    if (raw !== null) {
      if (!validProfileValue(key, raw))
        throw Error(
          "Some saved learning or display choices could not be validated. Nothing was exported.",
        );
      values[key] = raw;
    }
  }
  const raw = JSON.stringify(
    {
      format: "runset-profile",
      version: 1,
      exportedAt: new Date().toISOString(),
      game,
      values,
    },
    null,
    2,
  );
  importProfile(raw);
  return raw;
}
