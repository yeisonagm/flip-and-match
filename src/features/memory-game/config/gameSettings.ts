import type { GameSettings } from "../domain/types";

export const DEFAULT_GAME_SETTINGS = {
  preview: { enabled: true, durationMs: 2000 }, // enough time to actually register a few cards
  maxLives: 3,
  matchLockoutMs: 600, // matches the caption entrance animation
  missLockoutMs: 900, // viewers stand far from a wall display and need longer
} as const satisfies GameSettings;
