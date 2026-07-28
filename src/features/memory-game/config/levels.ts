import type { LevelId } from "../domain/types";

export interface LevelConfig {
  readonly label: string;
  readonly pairs: number;
}

// No cols/rows here: the board orientation depends on the screen (portrait vs
// landscape), not on the level, so Board computes both from `pairs` at render time —
// see shared/lib/computeGridDimensions.ts.
// 6, 9, 12 pairs: an even +3 step per level. 10 (the original hard) broke that pattern
// (+3, then only +1) and didn't feel meaningfully harder than medium.
export const LEVELS = {
  easy: { label: "Fácil", pairs: 6 },
  medium: { label: "Medio", pairs: 9 },
  hard: { label: "Difícil", pairs: 12 },
} as const satisfies Record<LevelId, LevelConfig>;

// Object.entries(LEVELS) widens keys to `string`, which would need an `as LevelId[]`
// cast to iterate safely. This stays typed without one.
export const LEVEL_IDS: readonly LevelId[] = ["easy", "medium", "hard"];
