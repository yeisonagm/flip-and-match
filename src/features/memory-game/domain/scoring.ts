// 10 points per second and 100 per miss: a mismatch costs about as much as memorizing
// ten extra seconds, which is roughly its real cost on a large board.
export const computeScore = (elapsedSeconds: number, misses: number): number =>
  Math.max(0, 10_000 - elapsedSeconds * 10 - misses * 100);
