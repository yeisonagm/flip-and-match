import { describe, expect, it } from "vitest";
import { LEVELS } from "@/features/memory-game/config/levels";
import { CATALOG } from "../places.data";

// import.meta.glob rather than node:fs: it resolves against the Vite root, so the test
// doesn't depend on the working directory, and it keeps this file free of Node types
// (the app tsconfig is browser-only on purpose).
const IMAGE_FILES = new Set(Object.keys(import.meta.glob("/public/images/places/*")));

describe("CATALOG", () => {
  it("points every place at a file that exists", () => {
    // The one invariant nothing else can catch: a typo'd id or a swapped extension just
    // renders the generic placeholder, which looks like a deliberate design choice.
    const missing = CATALOG.map((place) => place.imageUrl).filter(
      (url) => !IMAGE_FILES.has(url.replace(/^\./, "/public")),
    );
    expect(missing).toEqual([]);
  });

  it("leaves no image file unused", () => {
    const used = new Set(CATALOG.map((place) => place.imageUrl.replace(/^\./, "/public")));
    expect([...IMAGE_FILES].filter((file) => !used.has(file))).toEqual([]);
  });

  it("uses ASCII-only image paths", () => {
    // A ñ or an accent survives `pnpm dev` and breaks only inside the packaged .exe,
    // where the path has to round-trip through tauri.localhost and NSIS.
    const nonAscii = CATALOG.filter((place) => !/^[ -~]+$/.test(place.imageUrl));
    expect(nonAscii).toEqual([]);
  });

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
