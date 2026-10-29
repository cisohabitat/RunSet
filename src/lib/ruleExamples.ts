// Read-only teaching diagrams. Tests submit these same physical IDs to the
// authoritative reducer; the diagrams never create or replace a live game.
export const openingExample = [
  [7, 33, 59],
  [1, 27, 53],
] as const;
export const jokerExample = {
  before: [3, 104, 5],
  replacement: [3, 4, 5],
  reuse: [6, 7, 104],
  rack: [4, 6, 7],
} as const;
