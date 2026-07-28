import { useState } from "react";
import type { TouristPlace } from "@/features/catalog";
import { PlacePlaceholder } from "./PlacePlaceholder";

// A shimmering gradient shows while the photo is still downloading, then the photo fades
// in — a first-visit concern only: platform/pwa precaches every place photo, so every
// load after the first resolves this <img> from disk almost instantly and the shimmer
// never has time to show.
export function PlaceImage({ place }: { readonly place: TouristPlace }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) return <PlacePlaceholder placeId={place.id} />;
  return (
    <span className="place-image" data-loaded={loaded}>
      <img
        className="place-image-photo"
        src={place.imageUrl}
        alt="" // decorative — the accessible name comes from the card button's aria-label
        draggable={false}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
