import type { ScoreEntry } from "./types";

export const MAX_ENTRIES = 20;

export const rankWith = (
  existing: readonly ScoreEntry[],
  entry: ScoreEntry,
): readonly ScoreEntry[] =>
  [...existing, entry]
    .sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds) // tie-break: less time wins
    .slice(0, MAX_ENTRIES);
