import { describe, expect, it } from "vitest";
import { LEVELS } from "@/features/memory-game/config/levels";
import { CATALOG } from "../places.data";

describe("CATALOG", () => {
  it("has no duplicate ids", () => {
    // A duplicate id would let the same place enter the deck twice — four cards of the
    // same place, which is exactly the unsolvable board this invariant rules out.
    const ids = CATALOG.map((place) => place.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has enough places for the hardest level", () => {
    const maxPairs = Math.max(...Object.values(LEVELS).map((level) => level.pairs));
    expect(CATALOG.length).toBeGreaterThanOrEqual(maxPairs);
  });
});
