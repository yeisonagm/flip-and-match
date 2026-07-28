import { useState } from "react";
import type { TouristPlace } from "@/features/catalog";
import { copy } from "@/shared/copy/es";
import { Modal } from "@/shared/ui/Modal";
import { PlaceGallery } from "./PlaceGallery";

interface VictoryModalProps {
  readonly places: readonly TouristPlace[];
  readonly score: number;
  readonly onSaveScore: (playerName: string) => void;
  readonly onNextLevel: (() => void) | null;
  readonly onExit: () => void;
}

export function VictoryModal({
  places,
  score,
  onSaveScore,
  onNextLevel,
  onExit,
}: VictoryModalProps) {
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <Modal>
      <h2>{copy.victory.title}</h2>
      <p className="modal-score">{copy.victory.scoreLabel(score)}</p>
      <h3>{copy.victory.subtitle}</h3>
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
          <input
            type="text"
            className="modal-name-input"
            value={playerName}
            onChange={(event) => setPlayerName(event.currentTarget.value)}
            placeholder={copy.victory.playerNamePlaceholder}
            maxLength={40}
          />
          <button type="submit" className="btn">
            {copy.victory.save}
          </button>
        </form>
      )}
      <div className="modal-actions">
        {onNextLevel !== null && (
          <button type="button" className="btn" onClick={onNextLevel}>
            {copy.victory.nextLevel}
          </button>
        )}
        <button type="button" className="btn" onClick={onExit}>
          {copy.victory.backToMenu}
        </button>
      </div>
    </Modal>
  );
}
