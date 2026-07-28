export { DEFAULT_GAME_SETTINGS } from "./config/gameSettings";
export type { LevelConfig } from "./config/levels";
export { LEVELS } from "./config/levels";
export type { BuildDeckOptions } from "./domain/buildDeck";
export { buildDeck } from "./domain/buildDeck";
export { createInitialState } from "./domain/createInitialState";
export { gameReducer } from "./domain/gameReducer";
export { livesRemaining } from "./domain/lives";
export { computeScore } from "./domain/scoring";
export type {
  Card,
  GameAction,
  GameSettings,
  GameState,
  GameStatus,
  LevelId,
} from "./domain/types";
export { isEvaluating, isFinished } from "./domain/types";
