import { useState } from "react";
import type { TouristPlace } from "@/features/catalog";
import { PlacePlaceholder } from "./PlacePlaceholder";

// Both branches share the same absolute-fill geometry (see .place-image in
// styles/index.css), so swapping to the placeholder on error causes zero layout shift.
export function PlaceImage({ place }: { readonly place: TouristPlace }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PlacePlaceholder placeId={place.id} />;
  return (
    <img
      className="place-image"
      src={place.imageUrl}
      alt="" // decorative — the accessible name comes from the card button's aria-label
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
