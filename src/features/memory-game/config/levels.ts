import type { LevelId } from "../domain/types";

export interface LevelConfig {
  readonly label: string;
  readonly cols: number;
  readonly rows: number;
  readonly pairs: number; // invariant: cols * rows === pairs * 2, tested in __tests__/levels.test.ts
}

// Always more columns than rows: the target is a 16:9 landscape display, where height
// is the scarce dimension.
export const LEVELS = {
  easy: { label: "Fácil", cols: 4, rows: 3, pairs: 6 },
  // 6x3, not 4x4: cols must stay strictly greater than rows (see comment above), and
  // 4x4 is a square grid — it violated its own invariant until the domain test caught it.
  medium: { label: "Medio", cols: 6, rows: 3, pairs: 9 },
  hard: { label: "Difícil", cols: 5, rows: 4, pairs: 10 },
} as const satisfies Record<LevelId, LevelConfig>;
