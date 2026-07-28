import { copy } from "@/shared/copy/es";
import { formatTime } from "@/shared/lib/formatTime";
import { LivesIndicator } from "./LivesIndicator";

interface GameHeaderProps {
  readonly levelLabel: string;
  readonly maxLives: number | null;
  readonly livesRemaining: number | null;
  readonly elapsedMs: number;
  readonly score: number;
  readonly onExit: () => void;
}

// Lives come first, left to right: it's the information most urgent to read at a
// distance — losing track of it is worse than losing track of the score.
export function GameHeader({
  levelLabel,
  maxLives,
  livesRemaining,
  elapsedMs,
  score,
  onExit,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <span className="game-header-level">{levelLabel}</span>
      {maxLives !== null && livesRemaining !== null && (
        <LivesIndicator max={maxLives} remaining={livesRemaining} />
      )}
      <span className="game-header-stat">
        <span className="game-header-stat-label">{copy.game.time}</span>
        <span className="game-header-stat-value">{formatTime(elapsedMs)}</span>
      </span>
      <span className="game-header-stat">
        <span className="game-header-stat-label">{copy.game.score}</span>
        <span className="game-header-stat-value">{score}</span>
      </span>
      <button type="button" className="btn btn-icon" aria-label={copy.game.exit} onClick={onExit}>
        ✕
      </button>
    </header>
  );
}
