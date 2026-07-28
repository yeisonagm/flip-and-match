import { useState } from "react";
import type { TouristPlace } from "@/features/catalog";
import { PlacePlaceholder } from "./PlacePlaceholder";

// Two layers of the same file, because the photos arrive in every aspect ratio and both
// single-layer options are wrong: `cover` fills the card but crops — a portrait photo in
// a square cell loses the monument out of frame — and `contain` shows the whole photo but
// leaves bars. So the sharp copy is `contain` (nothing is ever cropped, no zoom) and a
// blurred, over-scaled copy of the same file fills whatever it doesn't cover.
// Both branches keep the same absolute-fill geometry (see .place-image in
// styles/index.css), so falling back to the placeholder causes zero layout shift.
export function PlaceImage({ place }: { readonly place: TouristPlace }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PlacePlaceholder placeId={place.id} />;
  return (
    <span className="place-image">
      <span
        className="place-image-backdrop"
        style={{ backgroundImage: `url("${place.imageUrl}")` }}
        aria-hidden="true"
      />
      <img
        className="place-image-photo"
        src={place.imageUrl}
        alt="" // decorative — the accessible name comes from the card button's aria-label
        draggable={false}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
