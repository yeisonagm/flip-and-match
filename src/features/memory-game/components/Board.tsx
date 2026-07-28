import type { CSSProperties } from "react";
import type { Card } from "../domain/types";
import { CardItem } from "./CardItem";

type BoardStyle = CSSProperties & { "--cols": number; "--rows": number };

interface BoardProps {
  readonly cards: readonly Card[];
  readonly cols: number;
  readonly rows: number;
  readonly disabled: boolean;
  readonly onSelect: (instanceId: string) => void;
}

export function Board({ cards, cols, rows, disabled, onSelect }: BoardProps) {
  const style: BoardStyle = { "--cols": cols, "--rows": rows };
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
