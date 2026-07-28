import logo from "@/assets/logo.png";
import { copy } from "@/shared/copy/es";
import { formatTime } from "@/shared/lib/formatTime";
import type { LevelId } from "../domain/types";
import { LevelSteps } from "./LevelSteps";
import { LivesIndicator } from "./LivesIndicator";
import { StatPill } from "./StatPill";

interface GameHeaderProps {
  readonly levelId: LevelId;
  readonly maxLives: number | null;
  readonly livesRemaining: number | null;
  readonly elapsedMs: number;
  readonly score: number;
  readonly attempts: number;
  readonly onExit: () => void;
  readonly onToggleFullscreen: () => void;
}

// Three stacked bands, mirroring the reference UI: a white brand card flanked by the two
// round controls, a row of stat pills, then the difficulty stepper sitting straight on the
// page background. Each band is its own row so the 64x64 controls (§11 rule 4) never
// compete for horizontal space with the stats — the old single-row header used to wrap the
// exit button onto a line of its own and double its own height on narrow screens.
export function GameHeader({
  levelId,
  maxLives,
  livesRemaining,
  elapsedMs,
  score,
  attempts,
  onExit,
  onToggleFullscreen,
}: GameHeaderProps) {
  const hasLives = maxLives !== null && livesRemaining !== null;
  return (
    <header className="game-header">
      <div className="game-brand">
        <button type="button" className="btn btn-icon" aria-label={copy.game.exit} onClick={onExit}>
          ✕
        </button>
        <div className="game-brand-identity">
          <img className="game-brand-logo" src={logo} alt="" />
          <span className="game-brand-text">
            <span className="game-brand-title">{copy.menu.title}</span>
            <span className="game-brand-subtitle">{copy.game.brandSubtitle}</span>
          </span>
        </div>
        <button
          type="button"
          className="btn btn-icon"
          aria-label={copy.game.fullscreen}
          onClick={onToggleFullscreen}
        >
          ⛶
        </button>
      </div>

      <div className="game-header-stats" data-lives={hasLives}>
        <StatPill tone="gold" icon="⭐" label={copy.game.score}>
          {score.toLocaleString("es-PE")}
        </StatPill>
        <StatPill tone="mint" icon="👆" label={copy.game.attempts}>
          {attempts}
        </StatPill>
        <StatPill tone="peach" icon="⏱️" label={copy.game.time}>
          {formatTime(elapsedMs)}
        </StatPill>
        {hasLives && (
          <div className="stat-pill" data-tone="rose">
            <LivesIndicator max={maxLives} remaining={livesRemaining} />
          </div>
        )}
      </div>

      <LevelSteps currentLevelId={levelId} />
    </header>
  );
}
