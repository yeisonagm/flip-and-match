import type { TouristPlace } from "@/features/catalog";
import { copy } from "@/shared/copy/es";
import { formatTime } from "@/shared/lib/formatTime";
import { Modal } from "@/shared/ui/Modal";
import { PlaceGallery } from "./PlaceGallery";
import { StatTile } from "./StatTile";

interface DefeatModalProps {
  readonly places: readonly TouristPlace[];
  readonly levelLabel: string;
  readonly totalPairs: number;
  readonly maxLives: number | null;
  readonly elapsedSeconds: number;
  readonly matches: number;
  readonly misses: number;
  readonly onRetry: () => void;
  readonly onExit: () => void;
}

// No score, no star rating, and no save option here by design: a game over run never
// finished, so a number implying it "scored" or "rated" something is misleading. Score
// only ever appears live during play and on the victory screen.
export function DefeatModal({
  places,
  levelLabel,
  totalPairs,
  maxLives,
  elapsedSeconds,
  matches,
  misses,
  onRetry,
  onExit,
}: DefeatModalProps) {
  return (
    <Modal>
      <div className="modal-icon" data-variant="defeat" aria-hidden="true">
        😔
      </div>
      <h2>{copy.defeat.title}</h2>
      <p className="modal-subtitle">{copy.defeat.subtitle(levelLabel, matches, totalPairs)}</p>
      <div className="stat-grid">
        <StatTile icon="⏱" label={copy.game.time} value={formatTime(elapsedSeconds * 1000)} />
        <StatTile icon="✅" label={copy.game.matches} value={matches} />
        <StatTile icon="❌" label={copy.game.misses} value={misses} />
        {maxLives !== null && (
          <StatTile icon="💔" label={copy.game.lives} value={`0/${maxLives}`} />
        )}
      </div>
      <p className="modal-encouragement">{copy.defeat.encouragement} 💪</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-cta" data-variant="defeat" onClick={onRetry}>
          ↻ {copy.defeat.retry}
        </button>
        <button type="button" className="btn btn-outline" onClick={onExit}>
          {copy.defeat.backToMenu}
        </button>
      </div>
      {places.length > 0 && (
        <>
          <h3 className="modal-gallery-title">{copy.defeat.gallerySubtitle}</h3>
          <PlaceGallery places={places} />
        </>
      )}
    </Modal>
  );
}
