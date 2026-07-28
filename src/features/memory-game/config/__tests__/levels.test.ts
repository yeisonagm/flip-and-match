import { describe, expect, it } from "vitest";
import { LEVELS } from "../levels";

describe("LEVELS", () => {
  for (const [id, level] of Object.entries(LEVELS)) {
    it(`${id}: cols * rows equals pairs * 2`, () => {
      expect(level.cols * level.rows).toBe(level.pairs * 2);
    });

    it(`${id}: has more columns than rows`, () => {
      expect(level.cols).toBeGreaterThan(level.rows);
    });
  }
});
