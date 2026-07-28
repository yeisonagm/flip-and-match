export interface ScoreEntry {
  readonly id: string;
  readonly playerName: string;
  readonly score: number;
  readonly timeSeconds: number;
  readonly misses: number;
  readonly date: string; // ISO yyyy-mm-dd
}
