import { exerciseKinds, type ExerciseKind } from "../engine/exercises";
export interface SoloProgress {
  version: 1;
  completed: string[];
  kinds: ExerciseKind[];
}
export const emptySolo = (): SoloProgress => ({
  version: 1,
  completed: [],
  kinds: [],
});
export function validSolo(value: unknown): value is SoloProgress {
  if (!value || typeof value !== "object") return false;
  const p = value as SoloProgress;
  return (
    p.version === 1 &&
    Array.isArray(p.completed) &&
    p.completed.length <= 200 &&
    p.completed.every(
      (x) =>
        typeof x === "string" &&
        /^(opening|extend|repair|joker):[1-9][0-9]{0,5}$/.test(x),
    ) &&
    new Set(p.completed).size === p.completed.length &&
    Array.isArray(p.kinds) &&
    p.kinds.length <= 4 &&
    p.kinds.every((k) => exerciseKinds.includes(k)) &&
    new Set(p.kinds).size === p.kinds.length &&
    p.completed.every((x) => p.kinds.includes(x.split(":")[0] as ExerciseKind))
  );
}
/** Deterministic union converges across tabs; bounded records are not a streak. */
export function mergeSolo(
  p: SoloProgress,
  incoming: SoloProgress,
): SoloProgress {
  const completed = [...new Set([...p.completed, ...incoming.completed])]
    .sort()
    .slice(-200);
  const kinds = exerciseKinds.filter(
    (kind) => p.kinds.includes(kind) || incoming.kinds.includes(kind),
  );
  return JSON.stringify(completed) === JSON.stringify(p.completed) &&
    JSON.stringify(kinds) === JSON.stringify(p.kinds)
    ? p
    : { version: 1, completed, kinds };
}
export function completeSolo(
  p: SoloProgress,
  kind: ExerciseKind,
  code: number,
): SoloProgress {
  return mergeSolo(p, {
    version: 1,
    completed: [`${kind}:${code}`],
    kinds: [kind],
  });
}
