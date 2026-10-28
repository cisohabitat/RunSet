import { inspectMeld } from "../engine/meld";
import { tiles } from "../engine/tiles";
/** Summarise only the present public meld, using the engine's joker values. */
export function meldOverview(ids: number[]) {
  const info = inspectMeld(ids),
    natural = ids.find((id) => !tiles[id]?.joker);
  return {
    count: ids.length,
    valid: info.valid,
    kind: info.kind,
    colour:
      info.valid && info.kind === "run" && natural !== undefined
        ? tiles[natural].color
        : null,
    numbers: !info.valid
      ? ""
      : info.kind === "group"
        ? String(info.values[info.ordered[0]])
        : `${info.values[info.ordered[0]]}–${info.values[info.ordered.at(-1)!]}`,
    points: info.points,
    first: info.ordered.at(0),
  };
}
