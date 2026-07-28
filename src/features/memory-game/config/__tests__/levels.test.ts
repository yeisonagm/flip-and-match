import { describe, expect, it } from "vitest";
import { LEVEL_IDS, LEVELS } from "../levels";

describe("LEVELS", () => {
  it("difficulty increases with more pairs, in LEVEL_IDS order", () => {
    const pairs = LEVEL_IDS.map((id) => LEVELS[id].pairs);
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i]).toBeGreaterThan(pairs[i - 1] ?? 0);
    }
  });
});
