import type { TouristPlace } from "@/features/catalog";

export type LevelId = "easy" | "medium" | "hard";

// EVALUATING_MATCH / EVALUATING_MISS, not one EVALUATING status plus a pending-outcome
// field: the lockout duration (matchLockoutMs vs missLockoutMs) must be known the instant
// the status is set, and SELECT_CARD already knows the outcome by then. See gameReducer.ts.
export type GameStatus =
  | "PREVIEW"
  | "PLAYING"
  | "EVALUATING_MATCH"
  | "EVALUATING_MISS"
  | "VICTORY"
  | "DEFEAT";

export const isEvaluating = (status: GameStatus): boolean =>
  status === "EVALUATING_MATCH" || status === "EVALUATING_MISS";

export const isFinished = (status: GameStatus): boolean =>
  status === "VICTORY" || status === "DEFEAT";

export interface GameSettings {
  readonly preview: {
    readonly enabled: boolean;
    readonly durationMs: number;
  };
  /** null disables the defeat condition entirely: no lives, no DEFEAT. */
  readonly maxLives: number | null;
  readonly matchLockoutMs: number;
  readonly missLockoutMs: number;
}

export interface Card {
  readonly instanceId: string; // unique per board slot; the pair shares place.id
  readonly place: TouristPlace;
  readonly isFlipped: boolean;
  readonly isMatched: boolean;
}

export interface GameState {
  readonly levelId: LevelId;
  readonly settings: GameSettings;
  readonly status: GameStatus;
  readonly cards: readonly Card[];
  readonly flipped: readonly string[]; // instanceIds, max 2
  readonly matches: number;
  readonly misses: number; // livesRemaining is derived from this + settings.maxLives, see lives.ts
  readonly startedAt: number | null; // performance.now()
  readonly elapsedMs: number;
}

export type GameAction =
  | {
      readonly type: "START";
      readonly cards: readonly Card[];
      readonly levelId: LevelId;
      readonly settings: GameSettings;
      readonly now: number;
    }
  | { readonly type: "END_PREVIEW"; readonly now: number }
  | { readonly type: "SELECT_CARD"; readonly instanceId: string } // decides MATCH vs MISS immediately
  | { readonly type: "RESOLVE_PAIR"; readonly now: number } // only commits the outcome SELECT_CARD already decided
  | { readonly type: "TICK"; readonly now: number };
