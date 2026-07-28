import type { GameSettings } from "../domain/types";

export const DEFAULT_GAME_SETTINGS = {
  // durationMs and maxLives below are overridden per level (see config/levels.ts
  // LEVELS[levelId].previewDurationMs / maxLives) the moment a real game deals a deck —
  // these values only satisfy the GameSettings type for a caller that doesn't care about
  // level-specific tuning.
  preview: { enabled: true, durationMs: 2000 },
  maxLives: 3,
  matchLockoutMs: 600, // matches the caption entrance animation
  missLockoutMs: 900, // viewers stand far from a wall display and need longer
} as const satisfies GameSettings;
