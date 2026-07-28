import { livesRemaining } from "./lives";
import { type GameAction, type GameState, isFinished } from "./types";

const elapsedAt = (state: GameState, now: number): number =>
  state.startedAt === null ? state.elapsedMs : now - state.startedAt;

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START": {
      const preview = action.settings.preview.enabled;
      return {
        levelId: action.levelId,
        settings: action.settings,
        status: preview ? "PREVIEW" : "PLAYING",
        cards: action.cards.map((c) => ({ ...c, isFlipped: preview, isMatched: false })),
        flipped: [],
        matches: 0,
        misses: 0,
        startedAt: preview ? null : action.now,
        elapsedMs: 0,
      };
    }

    case "END_PREVIEW": {
      // Idempotent: React StrictMode double-invokes effects in development, and a stray
      // second dispatch here must not restart the clock or re-flip already-hidden cards.
      if (state.status !== "PREVIEW") return state;
      return {
        ...state,
        status: "PLAYING",
        cards: state.cards.map((c) => ({ ...c, isFlipped: false })),
        startedAt: action.now,
      };
    }

    case "SELECT_CARD": {
      if (state.status !== "PLAYING") return state;
      // Reject non-primary pointers cover most simultaneous taps; this covers the rest —
      // a third selection can never land while two cards are already face up.
      if (state.flipped.length >= 2) return state;

      const picked = state.cards.find((c) => c.instanceId === action.instanceId);
      if (picked === undefined || picked.isFlipped || picked.isMatched) return state;

      const flipped = [...state.flipped, picked.instanceId];
      const faceUp = state.cards.map((c) =>
        c.instanceId === picked.instanceId ? { ...c, isFlipped: true } : c,
      );

      const [firstId] = state.flipped;
      if (firstId === undefined) return { ...state, cards: faceUp, flipped };

      const first = state.cards.find((c) => c.instanceId === firstId);
      if (first === undefined) return state;

      if (first.place.id !== picked.place.id) {
        return {
          ...state,
          cards: faceUp,
          flipped,
          misses: state.misses + 1,
          status: "EVALUATING_MISS",
        };
      }
      return {
        ...state,
        // Cards are marked matched immediately: the lockout is the caption's entrance
        // animation, not a decision delay (RF-06).
        cards: faceUp.map((c) => (flipped.includes(c.instanceId) ? { ...c, isMatched: true } : c)),
        flipped,
        matches: state.matches + 1,
        status: "EVALUATING_MATCH",
      };
    }

    case "RESOLVE_PAIR": {
      if (state.status === "EVALUATING_MATCH") {
        const won = state.cards.every((c) => c.isMatched);
        return {
          ...state,
          flipped: [],
          elapsedMs: elapsedAt(state, action.now),
          status: won ? "VICTORY" : "PLAYING",
        };
      }
      if (state.status === "EVALUATING_MISS") {
        const cards = state.cards.map((c) =>
          state.flipped.includes(c.instanceId) ? { ...c, isFlipped: false } : c,
        );
        // DEFEAT is checked before anything else: a miss that empties the last life
        // never resolves to VICTORY, even if it was the final pair (RF-09).
        const dead = livesRemaining(state) === 0;
        return {
          ...state,
          cards,
          flipped: [],
          elapsedMs: elapsedAt(state, action.now),
          status: dead ? "DEFEAT" : "PLAYING",
        };
      }
      return state;
    }

    case "TICK": {
      if (state.startedAt === null || isFinished(state.status)) return state;
      return { ...state, elapsedMs: action.now - state.startedAt };
    }

    default:
      return state;
  }
}
