import type { TouristPlace } from "@/features/catalog";
import { rankWith, type ScoreEntry, scoreRepository } from "@/features/leaderboard";
import {
  Board,
  type Card,
  computeScore,
  DefeatModal,
  GameFooter,
  GameHeader,
  LEVEL_IDS,
  LEVELS,
  type LevelId,
  livesRemaining,
  useMemoryGame,
  VictoryModal,
} from "@/features/memory-game";
import { fullscreen } from "@/platform/fullscreen";
import { createId } from "@/shared/lib/createId";
import type { Screen } from "../types";

interface GameScreenProps {
  readonly levelId: LevelId;
  readonly onNavigate: (screen: Screen) => void;
}

const matchedPlacesOf = (cards: readonly Card[]): readonly TouristPlace[] => {
  const seen = new Set<string>();
  const places: TouristPlace[] = [];
  for (const card of cards) {
    if (!card.isMatched || seen.has(card.place.id)) continue;
    seen.add(card.place.id);
    places.push(card.place);
  }
  return places;
};

export function GameScreen({ levelId, onNavigate }: GameScreenProps) {
  const { state, selectCard, restart } = useMemoryGame(levelId);
  const level = LEVELS[levelId];
  const disabled = state.status !== "PLAYING";
  const elapsedSeconds = Math.floor(state.elapsedMs / 1000);
  const score = computeScore(elapsedSeconds, state.misses);
  const nextLevelId = LEVEL_IDS[LEVEL_IDS.indexOf(levelId) + 1] ?? null;
  // 1/2/3 stars mirror the menu's difficulty indicator, not a performance score — the
  // domain has no notion of a per-run rating.
  const difficultyStars = LEVEL_IDS.indexOf(levelId) + 1;

  const exitToMenu = (): void => onNavigate({ kind: "MENU" });

  const saveScore = (playerName: string): void => {
    const entry: ScoreEntry = {
      id: createId(),
      playerName: playerName.trim() || "Jugador",
      score,
      timeSeconds: elapsedSeconds,
      misses: state.misses,
      date: new Date().toISOString().slice(0, 10),
    };
    scoreRepository.load(levelId).then((existing) => {
      scoreRepository.save(levelId, rankWith(existing, entry));
    });
  };

  return (
    <div className="app-shell">
      <GameHeader
        levelId={levelId}
        maxLives={state.settings.maxLives}
        livesRemaining={livesRemaining(state)}
        elapsedMs={state.elapsedMs}
        score={score}
        attempts={state.matches + state.misses}
        onExit={exitToMenu}
        onToggleFullscreen={() => fullscreen.toggle()}
      />
      <div className="board-area">
        <Board cards={state.cards} disabled={disabled} onSelect={selectCard} />
      </div>
      <GameFooter matches={state.matches} totalPairs={level.pairs} onRetry={restart} />
      {state.status === "VICTORY" && (
        <VictoryModal
          places={matchedPlacesOf(state.cards)}
          levelLabel={level.label}
          stars={difficultyStars}
          score={score}
          elapsedSeconds={elapsedSeconds}
          matches={state.matches}
          misses={state.misses}
          onSaveScore={saveScore}
          onNextLevel={
            nextLevelId === null ? null : () => onNavigate({ kind: "GAME", levelId: nextLevelId })
          }
          onExit={exitToMenu}
        />
      )}
      {state.status === "DEFEAT" && (
        <DefeatModal
          places={matchedPlacesOf(state.cards)}
          levelLabel={level.label}
          totalPairs={level.pairs}
          maxLives={state.settings.maxLives}
          elapsedSeconds={elapsedSeconds}
          matches={state.matches}
          misses={state.misses}
          onRetry={restart}
          onExit={exitToMenu}
        />
      )}
    </div>
  );
}
