import type { TouristPlace } from "@/features/catalog";
import { copy } from "@/shared/copy/es";
import { Modal } from "@/shared/ui/Modal";
import { PlaceGallery } from "./PlaceGallery";

interface DefeatModalProps {
  readonly places: readonly TouristPlace[];
  readonly onRetry: () => void;
  readonly onExit: () => void;
}

// No score and no save option here by design: a game over run never finished, so a
// number implying it "scored" something — let alone one you could save — is misleading.
// Score only ever appears live during play and on the victory screen.
export function DefeatModal({ places, onRetry, onExit }: DefeatModalProps) {
  return (
    <Modal>
      <h2>{copy.defeat.title}</h2>
      {places.length > 0 && (
        <>
          <h3>{copy.defeat.subtitle}</h3>
          <PlaceGallery places={places} />
        </>
      )}
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onRetry}>
          {copy.defeat.retry}
        </button>
        <button type="button" className="btn" onClick={onExit}>
          {copy.defeat.backToMenu}
        </button>
      </div>
    </Modal>
  );
}
