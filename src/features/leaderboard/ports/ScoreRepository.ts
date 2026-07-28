import type { LevelId } from "@/features/memory-game";
import type { ScoreEntry } from "../domain/types";

// Storage only — ranking and the Top-20 cap live in domain/ranking.ts so they're tested
// once and shared by every adapter. Async end to end: the real justification for this
// port is swapping to tauri-plugin-store later, whose API is async — a sync port here
// would guarantee the exact rewrite this abstraction exists to avoid.
export interface ScoreRepository {
  readonly load: (levelId: LevelId) => Promise<readonly ScoreEntry[]>;
  readonly save: (levelId: LevelId, entries: readonly ScoreEntry[]) => Promise<void>;
}
