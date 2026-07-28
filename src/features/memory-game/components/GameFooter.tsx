import { copy } from "@/shared/copy/es";

interface GameFooterProps {
  readonly matches: number;
  readonly totalPairs: number;
  readonly onRetry: () => void;
}

export function GameFooter({ matches, totalPairs, onRetry }: GameFooterProps) {
  const percent = totalPairs === 0 ? 0 : Math.round((matches / totalPairs) * 100);
  return (
    <footer className="game-footer">
      <button
        type="button"
        className="btn btn-icon game-footer-retry"
        aria-label={copy.game.retry}
        onClick={onRetry}
      >
        ↻
      </button>
      <div
        className="game-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalPairs}
        aria-valuenow={matches}
        aria-label={copy.game.pairsProgress(matches, totalPairs)}
      >
        <div className="game-progress-track">
          <div className="game-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="game-progress-label">{copy.game.pairsProgress(matches, totalPairs)}</span>
      </div>
    </footer>
  );
}
