import { reducer, turnCheck, type GameState } from "../engine/game";
import { inspectMeld } from "../engine/meld";

/** Suggestions describe a complete legal turn; intermediate edits stay available. */
export function suggestedDestinations(s: GameState, ids: number[]): string[] {
  if (s.phase !== "playing" || s.players[s.current].bot || !ids.length)
    return [];
  const available = new Set([
    ...s.players[s.current].rack,
    ...s.table.flatMap((m) => m.tiles),
  ]);
  if (ids.some((id) => !available.has(id))) return [];
  return ["new", ...s.table.map((m) => m.id)].filter((target) => {
    if (
      target !== "new" &&
      ids.every((id) =>
        s.table.find((m) => m.id === target)?.tiles.includes(id),
      )
    )
      return false;
    // Undo snapshots need not be copied to inspect a hypothetical destination.
    const trial = reducer({ ...s, history: [] }, { type: "move", ids, target });
    const check = turnCheck(trial);
    return (
      check.valid &&
      check.played.length > 0 &&
      // A rejected move returns the input position with no tile movement.
      JSON.stringify(trial.table) !== JSON.stringify(s.table)
    );
  });
}
export function turnGuidance(
  s: GameState,
  selected: number[],
  destinations: string[],
) {
  const p = s.players[s.current],
    check = turnCheck(s);
  const dirty = JSON.stringify(s.table) !== JSON.stringify(s.turnStart.table);
  const action = s.pool.length ? "draw a tile" : "pass";
  const endHelp = p.bot
    ? "Wait for your turn before playing tiles."
    : !dirty && !check.played.length
      ? `End turn is unavailable until you play a rack tile. You can ${action} instead.`
      : !check.valid
        ? "Ending now restores this turn and draws up to 3 penalty tiles. Keep editing, or Reset for free."
        : !check.played.length
          ? `Rearranging alone does not end a turn. Play a rack tile, or ${action}; unfinished edits will be reset.`
          : "Ready to end: every group and run is valid, and you played from your rack.";
  const message = p.bot
    ? "Watch the opponent. Your turn comes next."
    : s.table.some((m) => !inspectMeld(m.tiles).valid)
      ? "Complete the red-outlined group or run, or use Reset to undo this turn without a penalty."
      : !p.melded && check.played.length && check.points < 30
        ? `Your opening is ${check.points} / 30 points. Add more tiles from your own rack, or Reset for free.`
        : selected.length
          ? destinations.length
            ? `${selected.length} tiles selected. Choose an outlined destination. End turn will check the whole table before finishing.`
            : "No safe finish was found for these selected tiles. Select more tiles, or use New group or run to build in steps."
          : p.melded && check.valid && check.played.length
            ? "Your table is ready. Choose End turn to keep these moves, or continue playing."
            : !p.melded
              ? check.valid && check.played.length
                ? `Your opening is worth ${check.points} points. Choose End turn to complete your first play.`
                : `Select tiles → New group or run. Your first play needs 30 points. Place a rack tile before End turn, or ${action}.`
              : `Add tiles to a group or run, or make a new one. Play a rack tile before End turn, or ${action}.`;
  const compactMessage = p.bot
    ? "Watch the opponent; your turn is next."
    : s.table.some((m) => !inspectMeld(m.tiles).valid)
      ? "Complete the red-outlined meld, or Reset for free."
      : !p.melded && check.played.length && check.points < 30
        ? `Opening: ${check.points} / 30. Add rack tiles, or Reset.`
        : selected.length
          ? destinations.length
            ? `${selected.length} selected. Choose an outlined destination.`
            : "No safe finish yet. Select more tiles, or build in steps."
          : check.valid && check.played.length
            ? "Ready: choose End turn to keep this play."
            : !p.melded
              ? `Select tiles → New group or run. Reach 30 points, or ${action}.`
              : `Add to a meld, make a new one, or ${action}.`;
  return { message, compactMessage, endHelp };
}
