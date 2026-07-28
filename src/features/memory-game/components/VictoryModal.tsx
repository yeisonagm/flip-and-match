import { useState } from "react";
import type { TouristPlace } from "@/features/catalog";
import { copy } from "@/shared/copy/es";
import { formatTime } from "@/shared/lib/formatTime";
import { Modal } from "@/shared/ui/Modal";
import { PlaceGallery } from "./PlaceGallery";
import { StatTile } from "./StatTile";

interface VictoryModalProps {
  readonly places: readonly TouristPlace[];
  readonly levelLabel: string;
  readonly stars: number;
  readonly score: number;
  readonly elapsedSeconds: number;
  readonly matches: number;
  readonly misses: number;
  readonly onSaveScore: (playerName: string) => void;
  readonly onNextLevel: (() => void) | null;
  readonly onExit: () => void;
}

// Continuing is the point of this screen; saving a name is a courtesy on the way out.
// "Siguiente nivel" / "Volver al menú" are the primary actions, first and full-size —
// the save form sits below as a small, clearly optional row, never blocking either one.
export function VictoryModal({
  places,
  levelLabel,
  stars,
  score,
  elapsedSeconds,
  matches,
  misses,
  onSaveScore,
  onNextLevel,
  onExit,
}: VictoryModalProps) {
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <Modal>
      <div className="modal-icon" data-variant="victory" aria-hidden="true">
        🎉
      </div>
      <h2>{copy.victory.title}</h2>
      <p className="modal-subtitle">
        {"★".repeat(stars)}
        {"☆".repeat(3 - stars)} · {copy.victory.subtitle(levelLabel)}
      </p>
      <div className="stat-grid">
        <StatTile icon="⭐" label={copy.game.score} value={score} />
        <StatTile icon="⏱" label={copy.game.time} value={formatTime(elapsedSeconds * 1000)} />
        <StatTile icon="✅" label={copy.game.matches} value={matches} />
        <StatTile icon="❌" label={copy.game.misses} value={misses} />
      </div>
      <div className="modal-actions">
        {onNextLevel !== null && (
          <button
            type="button"
            className="btn btn-cta"
            data-variant="victory"
            onClick={onNextLevel}
          >
            {copy.victory.nextLevel} →
          </button>
        )}
        <button type="button" className="btn btn-outline" onClick={onExit}>
          {copy.victory.backToMenu}
        </button>
      </div>
      <h3 className="modal-gallery-title">{copy.victory.gallerySubtitle}</h3>
      <PlaceGallery places={places} />
      {saved ? (
        <p className="modal-saved">{copy.victory.saved}</p>
      ) : (
        <form
          className="modal-save-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSaveScore(playerName);
            setSaved(true);
          }}
        >
          <span className="modal-save-question">{copy.victory.saveQuestion}</span>
          <input
            type="text"
            className="modal-name-input"
            value={playerName}
            onChange={(event) => setPlayerName(event.currentTarget.value)}
            placeholder={copy.victory.playerNamePlaceholder}
            maxLength={40}
          />
          <button type="submit" className="btn btn-subtle">
            {copy.victory.save}
          </button>
        </form>
      )}
    </Modal>
  );
}
