import { describe, expect, it } from "vitest";
import { computeScore } from "../scoring";

describe("computeScore", () => {
  it("never returns a negative score", () => {
    expect(computeScore(10_000, 500)).toBe(0);
  });

  it("gives 10000 for an instant, perfect game", () => {
    expect(computeScore(0, 0)).toBe(10000);
  });
});
