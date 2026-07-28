// No `region` field: it would only be documentation of the catalog content (see
// IMPLEMENTATION_PLAN.md §20), not a value any component reads — a dead field that
// noUnusedLocals never catches.
export interface TouristPlace {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
}
