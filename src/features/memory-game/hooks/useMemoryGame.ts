import { useEffect, useReducer, useState } from "react";
import { CATALOG } from "@/features/catalog";
import { DEFAULT_GAME_SETTINGS } from "../config/gameSettings";
import { LEVELS } from "../config/levels";
import { buildDeck } from "../domain/buildDeck";
import { createInitialState } from "../domain/createInitialState";
import { gameReducer } from "../domain/gameReducer";
import type { GameSettings, LevelId } from "../domain/types";
import { isEvaluating } from "../domain/types";
import { useGameClock } from "./useGameClock";

export function useMemoryGame(levelId: LevelId, settings: GameSettings = DEFAULT_GAME_SETTINGS) {
  const [state, dispatch] = useReducer(gameReducer, settings, createInitialState);
  const [previousPlaceIds, setPreviousPlaceIds] = useState<readonly string[]>([]);

  const deal = (excluding: readonly string[]): void => {
    const level = LEVELS[levelId];
    const cards = buildDeck(CATALOG, level.pairs, { previousPlaceIds: excluding });
    setPreviousPlaceIds([...new Set(cards.map((c) => c.place.id))]);
    // maxLives and preview.durationMs come from the level, not the settings prop:
    // harder levels grant more lives and a longer preview (§ LEVELS comment), so neither
    // can be a single fixed value across all three.
    const levelSettings = {
      ...settings,
      maxLives: level.maxLives,
      preview: { ...settings.preview, durationMs: level.previewDurationMs },
    };
    dispatch({ type: "START", cards, levelId, settings: levelSettings, now: performance.now() });
  };

  // Deals a fresh deck only when the level or settings prop actually changes. `deal`
  // reads and writes previousPlaceIds, so naming it (or previousPlaceIds) as a dependency
  // would re-deal after every single match or miss instead of once per new game.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — see comment above
  useEffect(() => {
    deal(previousPlaceIds);
  }, [levelId, settings]);

  useEffect(() => {
    if (state.status !== "PREVIEW") return;
    // state.settings, not the hook's own `settings` param: START merges in the level's
    // previewDurationMs (see `deal` above), and the outer `settings` prop never reflects
    // that override — reading it here would silently ignore the per-level duration.
    const id = window.setTimeout(
      () => dispatch({ type: "END_PREVIEW", now: performance.now() }),
      state.settings.preview.durationMs,
    );
    return () => window.clearTimeout(id);
  }, [state.status, state.settings.preview.durationMs]);

  useEffect(() => {
    if (!isEvaluating(state.status)) return;
    const ms =
      state.status === "EVALUATING_MATCH" ? settings.matchLockoutMs : settings.missLockoutMs;
    const id = window.setTimeout(
      () => dispatch({ type: "RESOLVE_PAIR", now: performance.now() }),
      ms,
    );
    return () => window.clearTimeout(id);
  }, [state.status, settings.matchLockoutMs, settings.missLockoutMs]);

  useGameClock(state.status, state.startedAt, dispatch);

  const selectCard = (instanceId: string): void => {
    dispatch({ type: "SELECT_CARD", instanceId });
  };

  const restart = (): void => deal(previousPlaceIds);

  return { state, selectCard, restart };
}
