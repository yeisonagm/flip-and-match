import { copy } from "@/shared/copy/es";
import { LEVEL_IDS, LEVELS } from "../config/levels";
import type { LevelId } from "../domain/types";

interface LevelStepsProps {
  readonly currentLevelId: LevelId;
}

// A difficulty position indicator, not a progression tracker: every level is playable from
// the menu, so the levels after the current one render greyed — never padlocked, which
// would claim a locking rule the game doesn't have.
export function LevelSteps({ currentLevelId }: LevelStepsProps) {
  const currentIndex = LEVEL_IDS.indexOf(currentLevelId);
  return (
    <ol className="level-steps" aria-label={copy.game.levelProgress}>
      {LEVEL_IDS.map((id, index) => {
        const state = index < currentIndex ? "past" : index === currentIndex ? "current" : "next";
        return (
          <li key={id} className="level-step" data-state={state} data-level={id}>
            <span className="level-step-dot" aria-hidden="true">
              {state === "past" ? "✓" : index + 1}
            </span>
            <span className="level-step-label">{LEVELS[id].label}</span>
          </li>
        );
      })}
    </ol>
  );
}
