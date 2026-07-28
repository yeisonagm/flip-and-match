import { copy } from "@/shared/copy/es";

interface LivesIndicatorProps {
  readonly max: number;
  readonly remaining: number;
}

// Unlimited lives (max === null upstream) render nothing — see GameHeader — rather than
// an infinity glyph nobody asked for. A text heart rather than the ❤️ emoji: it takes a
// CSS color, so a spent life fades to the border grey instead of needing a second glyph.
export function LivesIndicator({ max, remaining }: LivesIndicatorProps) {
  return (
    <div className="lives-indicator" role="status" aria-label={`${copy.game.lives}: ${remaining}`}>
      {Array.from({ length: max }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length heart row never reorders
        <span key={i} className="life-icon" data-lost={i >= remaining} aria-hidden="true">
          ♥
        </span>
      ))}
    </div>
  );
}
