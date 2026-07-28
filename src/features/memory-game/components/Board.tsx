import type { CSSProperties } from "react";
import { computeGridDimensions } from "@/shared/lib/computeGridDimensions";
import type { Card } from "../domain/types";
import { CardItem } from "./CardItem";

type BoardStyle = CSSProperties & {
  "--cols-landscape": number;
  "--rows-landscape": number;
  "--cols-portrait": number;
  "--rows-portrait": number;
};

interface BoardProps {
  readonly cards: readonly Card[];
  readonly disabled: boolean;
  readonly onSelect: (instanceId: string) => void;
}

// Both orientations are computed up front and picked between with a pure CSS container
// query (@container aspect-ratio, in styles/index.css) — the board reshapes itself the
// instant its container's aspect ratio changes, including on an F11 fullscreen toggle,
// with no resize listener or re-render needed.
export function Board({ cards, disabled, onSelect }: BoardProps) {
  const landscape = computeGridDimensions(cards.length, "landscape");
  const portrait = computeGridDimensions(cards.length, "portrait");
  const style: BoardStyle = {
    "--cols-landscape": landscape.cols,
    "--rows-landscape": landscape.rows,
    "--cols-portrait": portrait.cols,
    "--rows-portrait": portrait.rows,
  };
  return (
    <div className="board" style={style}>
      {cards.map((card, index) => (
        <CardItem
          key={card.instanceId}
          card={card}
          index={index}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
