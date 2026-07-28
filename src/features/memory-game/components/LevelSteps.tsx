import { copy } from "@/shared/copy/es";
import { LEVEL_IDS, LEVELS } from "../config/levels";
import type { LevelId } from "../domain/types";

interface LevelStepsProps {
  readonly currentLevelId: LevelId;
}

// An outlined padlock rather than 🔒: the emoji renders in the system's colour font, so
// it can't take the muted grey the rest of the step wears.
function LockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="0.95em"
      height="0.95em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4.2" y="10.4" width="15.6" height="10.4" rx="2.6" />
      <path d="M8 10.4V7.6a4 4 0 0 1 8 0v2.8" />
    </svg>
  );
}

// Difficulty run-through: levels behind the current one are done (check), the current one
// shows its number, the ones ahead show a padlock.
export function LevelSteps({ currentLevelId }: LevelStepsProps) {
  const currentIndex = LEVEL_IDS.indexOf(currentLevelId);
  return (
    <ol className="level-steps" aria-label={copy.game.levelProgress}>
      {LEVEL_IDS.map((id, index) => {
        const state = index < currentIndex ? "past" : index === currentIndex ? "current" : "next";
        return (
          <li key={id} className="level-step" data-state={state} data-level={id}>
            <span className="level-step-dot" aria-hidden="true">
              {state === "past" ? "✓" : state === "next" ? <LockGlyph /> : index + 1}
            </span>
            <span className="level-step-label">{LEVELS[id].label}</span>
          </li>
        );
      })}
    </ol>
  );
}
