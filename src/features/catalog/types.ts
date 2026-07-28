// `location` and `description` back the detail modal opened from the post-game gallery
// (PlaceDetailModal) — unlike the `region` field rejected earlier, these are values a
// component actually reads, not documentation. `description` is a fixed 2-tuple, not
// `readonly string[]`: the modal always renders exactly two paragraphs, so the type
// itself rules out a place shipping with zero, one, or five.
export interface TouristPlace {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly location: string;
  readonly description: readonly [string, string];
}
