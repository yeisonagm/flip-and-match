import { useEffect } from "react";
import type { GameAction, GameStatus } from "../domain/types";
import { isFinished } from "../domain/types";

// Interval only triggers the re-render; elapsed time comes from performance.now() minus
// startedAt. A counter that adds +1 per tick drifts several seconds over a long game.
//
// Gated on startedAt/isFinished, not status === "PLAYING": every pair triggers an
// EVALUATING_MATCH/EVALUATING_MISS lockout, so a PLAYING-only gate would stop the visible
// clock after every single pair — on a wall display that reads as the app hanging.
export function useGameClock(
  status: GameStatus,
  startedAt: number | null,
  dispatch: (action: GameAction) => void,
): void {
  useEffect(() => {
    if (startedAt === null || isFinished(status)) return;
    const id = window.setInterval(() => dispatch({ type: "TICK", now: performance.now() }), 250);
    return () => window.clearInterval(id);
  }, [startedAt, status, dispatch]);
}
