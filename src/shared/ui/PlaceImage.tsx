import { useState } from "react";
import type { TouristPlace } from "@/features/catalog";
import { PlacePlaceholder } from "./PlacePlaceholder";

// object-fit: cover, no letterboxing layer: the photo fills the box edge to edge on both
// axes, cropping whatever doesn't fit while keeping its own aspect ratio — the same
// treatment everywhere PlaceImage is used (card, gallery tile, detail modal), so a photo
// never looks different depending on where it's shown.
// Shares .place-image's absolute-fill geometry with the placeholder fallback, so an
// onError swap causes zero layout shift.
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
