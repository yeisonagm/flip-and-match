import type { TouristPlace } from "@/features/catalog";
import { type Rng, shuffle } from "@/shared/lib/shuffle";
import type { Card } from "./types";

const MAX_RESELECTION_ATTEMPTS = 10;

export interface BuildDeckOptions {
  readonly previousPlaceIds?: readonly string[];
  readonly rng?: Rng;
}

const sameSelection = (a: readonly string[], b: readonly string[]): boolean => {
  if (a.length !== b.length) return false;
  const seen = new Set(b);
  return a.every((id) => seen.has(id));
};

const pickPlaces = (
  catalog: readonly TouristPlace[],
  pairs: number,
  previousPlaceIds: readonly string[],
  rng: Rng,
): readonly TouristPlace[] => {
  let selection = shuffle(catalog, rng).slice(0, pairs);
  let attempts = 0;
  while (
    attempts < MAX_RESELECTION_ATTEMPTS &&
    sameSelection(
      selection.map((place) => place.id),
      previousPlaceIds,
    )
  ) {
    selection = shuffle(catalog, rng).slice(0, pairs);
    attempts += 1;
  }
  return selection;
};

// Every place contributes exactly two cards, by construction: a deck can never end up
// with three of one place and one of another, which would make the board unsolvable.
export function buildDeck(
  catalog: readonly TouristPlace[],
  pairs: number,
  options: BuildDeckOptions = {},
): readonly Card[] {
  const { previousPlaceIds = [], rng = Math.random } = options;
  const chosenPlaces = pickPlaces(catalog, pairs, previousPlaceIds, rng);
  const deck = chosenPlaces.flatMap((place) => [
    { instanceId: `${place.id}#0`, place, isFlipped: false, isMatched: false },
    { instanceId: `${place.id}#1`, place, isFlipped: false, isMatched: false },
  ]);
  return shuffle(deck, rng);
}
