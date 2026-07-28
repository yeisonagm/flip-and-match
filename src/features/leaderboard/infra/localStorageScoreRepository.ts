import type { LevelId } from "@/features/memory-game";
import type { ScoreEntry } from "../domain/types";
import type { ScoreRepository } from "../ports/ScoreRepository";

const key = (levelId: LevelId): string => `flip-and-match:scores:${levelId}`;

const isScoreEntry = (value: unknown): value is ScoreEntry =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "playerName" in value &&
  typeof value.playerName === "string" &&
  "score" in value &&
  typeof value.score === "number" &&
  "timeSeconds" in value &&
  typeof value.timeSeconds === "number" &&
  "misses" in value &&
  typeof value.misses === "number" &&
  "date" in value &&
  typeof value.date === "string";

export const localStorageScoreRepository: ScoreRepository = {
  async load(levelId) {
    try {
      const raw = globalThis.localStorage.getItem(key(levelId));
      if (raw === null) return [];
      const parsed: unknown = JSON.parse(raw);
      // A corrupted or hand-edited key must not take down the Scores screen.
      return Array.isArray(parsed) ? parsed.filter(isScoreEntry) : [];
    } catch {
      return [];
    }
  },

  async save(levelId, entries) {
    try {
      globalThis.localStorage.setItem(key(levelId), JSON.stringify(entries));
    } catch {
      // QuotaExceededError or a SecurityError from a locked-down WebView: losing one
      // leaderboard save must not crash the victory screen.
    }
  },
};
