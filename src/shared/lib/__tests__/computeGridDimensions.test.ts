import { describe, expect, it } from "vitest";
import { computeGridDimensions } from "../computeGridDimensions";

describe("computeGridDimensions", () => {
  it("reproduces the known-good landscape layouts", () => {
    expect(computeGridDimensions(12, "landscape")).toEqual({ cols: 4, rows: 3 });
    expect(computeGridDimensions(18, "landscape")).toEqual({ cols: 6, rows: 3 });
    expect(computeGridDimensions(20, "landscape")).toEqual({ cols: 5, rows: 4 });
  });

  it("mirrors the same pair for portrait, longer side on rows", () => {
    expect(computeGridDimensions(12, "portrait")).toEqual({ cols: 3, rows: 4 });
    expect(computeGridDimensions(18, "portrait")).toEqual({ cols: 3, rows: 6 });
    expect(computeGridDimensions(20, "portrait")).toEqual({ cols: 4, rows: 5 });
  });

  it("always covers every card exactly once: cols * rows === totalCards", () => {
    for (const totalCards of [12, 18, 20]) {
      for (const orientation of ["landscape", "portrait"] as const) {
        const { cols, rows } = computeGridDimensions(totalCards, orientation);
        expect(cols * rows).toBe(totalCards);
      }
    }
  });

  it("keeps the long side on the requested axis", () => {
    expect(computeGridDimensions(12, "landscape").cols).toBeGreaterThanOrEqual(
      computeGridDimensions(12, "landscape").rows,
    );
    expect(computeGridDimensions(12, "portrait").rows).toBeGreaterThanOrEqual(
      computeGridDimensions(12, "portrait").cols,
    );
  });
});
