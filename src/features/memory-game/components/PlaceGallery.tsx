import { useState } from "react";
import type { TouristPlace } from "@/features/catalog";
import { copy } from "@/shared/copy/es";
import { PlaceDetailModal } from "@/shared/ui/PlaceDetailModal";
import { PlaceImage } from "@/shared/ui/PlaceImage";

export function PlaceGallery({ places }: { readonly places: readonly TouristPlace[] }) {
  const [selected, setSelected] = useState<TouristPlace | null>(null);

  return (
    <>
      <ul className="place-gallery">
        {places.map((place) => (
          <li key={place.id} className="place-gallery-item">
            <button
              type="button"
              className="place-gallery-button"
              aria-label={copy.placeDetail.viewDetails(place.name)}
              onClick={() => setSelected(place)}
            >
              <PlaceImage place={place} />
              <span>{place.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {selected !== null && <PlaceDetailModal place={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
