// mm:ss, zero-padded. Used with font-variant-numeric: tabular-nums so digits don't
// shift width and make the clock visibly tremble on a large display.
export const formatTime = (elapsedMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
