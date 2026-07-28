import type { TouristPlace } from "@/features/catalog";
import { copy } from "@/shared/copy/es";
import { PlaceImage } from "./PlaceImage";

interface PlaceDetailModalProps {
  readonly place: TouristPlace;
  readonly onClose: () => void;
}

// A second, independent modal-overlay — not nested inside the victory/defeat Modal's own
// overlay — so it gets its own place in the stacking order (z-index: 200 in CSS, above
// the 100 the outer modal uses) without the outer modal having to know this one exists.
// The backdrop is a real <button>, a sibling of the panel rather than its parent: a click
// anywhere in the panel lands on the panel (topmost element there), never on the backdrop
// underneath, so there's no click-propagation dance to stop, and a native button is
// keyboard- and screen-reader-operable for free — no onKeyDown/role gymnastics needed.
export function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  return (
    <div className="modal-overlay place-detail-overlay">
      <button
        type="button"
        className="place-detail-backdrop"
        aria-label={copy.placeDetail.close}
        onClick={onClose}
      />
      <div className="place-detail-panel" role="dialog" aria-modal="true" aria-label={place.name}>
        <button
          type="button"
          className="btn btn-icon place-detail-close"
          aria-label={copy.placeDetail.close}
          onClick={onClose}
        >
          ✕
        </button>
        <div className="place-detail-media">
          <PlaceImage place={place} />
        </div>
        <div className="place-detail-info">
          <h2 className="place-detail-name">{place.name}</h2>
          <p className="place-detail-location">
            <span aria-hidden="true">📍 </span>
            <span className="visually-hidden">{copy.placeDetail.location}: </span>
            {place.location}
          </p>
          {place.description.map((paragraph, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 2-tuple, never reorders
            <p key={i} className="place-detail-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
