export type Orientation = "landscape" | "portrait";

export interface GridDimensions {
  readonly cols: number;
  readonly rows: number;
}

// Finds the factor pair of totalCards closest to a square, then orients the longer side
// along whichever axis the screen actually has more of: columns in landscape, rows in
// portrait. A whiteboard is always landscape, but the same board must also read well on
// a portrait tablet or phone — hardcoding "always more columns" broke that case.
export function computeGridDimensions(
  totalCards: number,
  orientation: Orientation,
): GridDimensions {
  let shortSide = 1;
  let longSide = totalCards;
  for (let candidate = 1; candidate * candidate <= totalCards; candidate++) {
    if (totalCards % candidate !== 0) continue;
    const pair = totalCards / candidate;
    if (pair - candidate < longSide - shortSide) {
      shortSide = candidate;
      longSide = pair;
    }
  }
  return orientation === "landscape"
    ? { cols: longSide, rows: shortSide }
    : { cols: shortSide, rows: longSide };
}
