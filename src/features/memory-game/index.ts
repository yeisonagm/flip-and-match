export { Board } from "./components/Board";
export { CardItem } from "./components/CardItem";
export { DefeatModal } from "./components/DefeatModal";
export { GameHeader } from "./components/GameHeader";
export { LivesIndicator } from "./components/LivesIndicator";
export { PlaceGallery } from "./components/PlaceGallery";
export { VictoryModal } from "./components/VictoryModal";
export { DEFAULT_GAME_SETTINGS } from "./config/gameSettings";
export type { LevelConfig } from "./config/levels";
export { LEVEL_IDS, LEVELS } from "./config/levels";
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
export { useGameClock } from "./hooks/useGameClock";
export { useMemoryGame } from "./hooks/useMemoryGame";
