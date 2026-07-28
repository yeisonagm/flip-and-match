import { describe, expect, it } from "vitest";
import { MAX_ENTRIES, rankWith } from "../ranking";
import type { ScoreEntry } from "../types";

const entry = (score: number, timeSeconds: number, id: string): ScoreEntry => ({
  id,
  playerName: id,
  score,
  timeSeconds,
  misses: 0,
  date: "2026-01-01",
});

describe("rankWith", () => {
  it("orders by score descending, then by less time on a tie", () => {
    const ranked = [entry(100, 50, "slow"), entry(100, 20, "fast"), entry(200, 90, "best")].reduce(
      (acc: readonly ScoreEntry[], e) => rankWith(acc, e),
      [],
    );
    expect(ranked.map((e) => e.id)).toEqual(["best", "fast", "slow"]);
  });

  it("never exceeds MAX_ENTRIES", () => {
    const many = Array.from({ length: MAX_ENTRIES + 5 }, (_, i) => entry(i, 0, `e${i}`));
    const ranked = many.reduce((acc: readonly ScoreEntry[], e) => rankWith(acc, e), []);
    expect(ranked.length).toBe(MAX_ENTRIES);
  });
});
