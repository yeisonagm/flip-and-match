import type { GameState } from "./types";

// null means unlimited: no life count to display, no DEFEAT ever. Never stored in
// GameState itself — misses + settings.maxLives always determine it, so storing it
// separately would be a desync waiting to happen.
export const livesRemaining = (state: GameState): number | null =>
  state.settings.maxLives === null ? null : Math.max(0, state.settings.maxLives - state.misses);
