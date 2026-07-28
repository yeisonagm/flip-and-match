import { useEffect, useState } from "react";
import { LeaderboardTable, type ScoreEntry, scoreRepository } from "@/features/leaderboard";
import { LEVEL_IDS, LEVELS, type LevelId } from "@/features/memory-game";
import { copy } from "@/shared/copy/es";
import type { Screen } from "../types";

interface ScoresScreenProps {
  readonly onNavigate: (screen: Screen) => void;
}

export function ScoresScreen({ onNavigate }: ScoresScreenProps) {
  const [levelId, setLevelId] = useState<LevelId>("easy");
  const [entries, setEntries] = useState<readonly ScoreEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    scoreRepository.load(levelId).then((loaded) => {
      if (!cancelled) setEntries(loaded);
    });
    return () => {
      cancelled = true; // a slow load from a previous tab must not overwrite a newer one
    };
  }, [levelId]);

  return (
    <main className="scores-screen">
      <h1 className="scores-title">{copy.scores.title}</h1>
      <div className="scores-tabs" role="tablist">
        {LEVEL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === levelId}
            className="btn scores-tab"
            data-active={id === levelId}
            onClick={() => setLevelId(id)}
          >
            {LEVELS[id].label}
          </button>
        ))}
      </div>
      {entries.length > 0 ? (
        <LeaderboardTable entries={entries} />
      ) : (
        <p className="scores-empty">{copy.scores.empty}</p>
      )}
      <button type="button" className="btn" onClick={() => onNavigate({ kind: "MENU" })}>
        {copy.scores.back}
      </button>
    </main>
  );
}
