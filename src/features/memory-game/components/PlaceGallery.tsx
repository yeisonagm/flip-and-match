import type { TouristPlace } from "@/features/catalog";
import { PlaceImage } from "@/shared/ui/PlaceImage";

export function PlaceGallery({ places }: { readonly places: readonly TouristPlace[] }) {
  return (
    <ul className="place-gallery">
      {places.map((place) => (
        <li key={place.id} className="place-gallery-item">
          <PlaceImage place={place} />
          <span>{place.name}</span>
        </li>
      ))}
    </ul>
  );
}
