export type Rng = () => number;

// Not the banned sort(() => Math.random() - 0.5): the key is drawn once per item, so the
// comparator is a consistent total order and the resulting permutation is uniform.
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): readonly T[] {
  return items
    .map((item) => ({ item, key: rng() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}
