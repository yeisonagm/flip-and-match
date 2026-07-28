import type { CSSProperties } from "react";
import { copy } from "@/shared/copy/es";
import { PlaceImage } from "@/shared/ui/PlaceImage";
import type { Card } from "../domain/types";

type CardStyle = CSSProperties & { "--card-index": number };

interface CardItemProps {
  readonly card: Card;
  readonly index: number;
  readonly disabled: boolean;
  readonly onSelect: (instanceId: string) => void;
}

export function CardItem({ card, index, disabled, onSelect }: CardItemProps) {
  const revealed = card.isFlipped || card.isMatched;
  // Both faces stay in the a11y tree at all times (backface-visibility is paint-only),
  // so the label must stay generic while face-down — a fixed place name here would leak
  // the pair to a screen reader before the card is ever flipped.
  const label = revealed ? card.place.name : copy.game.hiddenCard;
  const style: CardStyle = { "--card-index": index };

  return (
    <button
      type="button"
      className="card"
      data-flipped={revealed}
      data-matched={card.isMatched}
      aria-label={label}
      disabled={disabled || card.isMatched}
      style={style}
      onPointerDown={(event) => {
        if (!event.isPrimary) return; // reject non-primary pointers: touch boards fire simultaneous taps
        event.preventDefault(); // suppress the synthetic click this pointerdown would fire
        onSelect(card.instanceId);
      }}
      onClick={(event) => {
        if (event.detail === 0) onSelect(card.instanceId); // detail===0 ⇒ keyboard-generated click
      }}
    >
      <div className="card-inner">
        <div className="card-face card-face--back" />
        <div className="card-face card-face--front">
          <PlaceImage place={card.place} />
          <span className="card-caption">{card.place.name}</span>
        </div>
      </div>
    </button>
  );
}
