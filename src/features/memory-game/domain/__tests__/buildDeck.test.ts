import { describe, expect, it } from "vitest";
import type { TouristPlace } from "@/features/catalog";
import { buildDeck } from "../buildDeck";

const CATALOG: readonly TouristPlace[] = Array.from({ length: 6 }, (_, i) => ({
  id: `place-${i}`,
  name: `Place ${i}`,
  imageUrl: `./place-${i}.webp`,
  location: "Test",
  description: ["A", "B"],
}));

// Deterministic sequence so tests don't depend on Math.random.
const makeSeededRng = (seed: number) => {
  let state = seed;
  return (): number => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
};

describe("buildDeck", () => {
  it("returns exactly pairs * 2 cards", () => {
    expect(buildDeck(CATALOG, 4)).toHaveLength(8);
  });

  it("gives every chosen place exactly two cards — never three of one and one of another", () => {
    const deck = buildDeck(CATALOG, 4);
    const counts = new Map<string, number>();
    for (const card of deck) {
      counts.set(card.place.id, (counts.get(card.place.id) ?? 0) + 1);
    }
    expect([...counts.values()].every((count) => count === 2)).toBe(true);
  });

  it("gives every card a unique instanceId", () => {
    const deck = buildDeck(CATALOG, 4);
    expect(new Set(deck.map((c) => c.instanceId)).size).toBe(deck.length);
  });

  it("avoids repeating the previous deck's place selection when the catalog allows it", () => {
    const first = buildDeck(CATALOG, 4, { rng: makeSeededRng(1) });
    const previousPlaceIds = [...new Set(first.map((c) => c.place.id))];
    // Same seed: the first reselection attempt would reproduce `previousPlaceIds`
    // exactly, so a different result proves the retry guard actually engaged.
    const second = buildDeck(CATALOG, 4, { previousPlaceIds, rng: makeSeededRng(1) });
    const secondPlaceIds = [...new Set(second.map((c) => c.place.id))];
    expect(secondPlaceIds.sort()).not.toEqual([...previousPlaceIds].sort());
  });
});
