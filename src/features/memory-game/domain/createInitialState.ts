import type { GameSettings, GameState } from "./types";

// Seeds useReducer before the first game exists. START fully replaces this state, so the
// only requirement is a well-formed, empty GameState — never an `as GameState` cast.
export const createInitialState = (settings: GameSettings): GameState => ({
  levelId: "easy",
  settings,
  status: "PREVIEW",
  cards: [],
  flipped: [],
  matches: 0,
  misses: 0,
  startedAt: null,
  elapsedMs: 0,
});
