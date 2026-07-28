import type { TouristPlace } from "@/features/catalog";
import { copy } from "@/shared/copy/es";
import { Modal } from "@/shared/ui/Modal";
import { PlaceGallery } from "./PlaceGallery";

interface DefeatModalProps {
  readonly places: readonly TouristPlace[];
  readonly score: number;
  readonly onRetry: () => void;
  readonly onExit: () => void;
}

// No save option here by design: only victories enter the leaderboard, so a defeat
// screen with a name field would suggest a run that never finished can still rank.
export function DefeatModal({ places, score, onRetry, onExit }: DefeatModalProps) {
  return (
    <Modal>
      <h2>{copy.defeat.title}</h2>
      <p className="modal-score">{copy.defeat.scoreLabel(score)}</p>
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
