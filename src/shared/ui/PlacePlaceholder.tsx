// Deterministic per place so the two cards of a pair look identical and the board stays
// playable with zero image files present. Text-free: a name here would sit in the
// accessibility tree of a face-down card even while it's visually hidden.
const hueOf = (id: string): number => {
  let hash = 7;
  for (const char of id) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 360;
  }
  return hash;
};

export function PlacePlaceholder({ placeId }: { readonly placeId: string }) {
  const hue = hueOf(placeId);
  const accentHue = (hue + 47) % 360;
  return (
    <svg
      className="place-image"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100" height="100" fill={`hsl(${hue} 68% 62%)`} />
      <g fill={`hsl(${accentHue} 80% 85%)`} transform={`rotate(${hue % 90} 50 50)`}>
        <path d="M50 18 L74 42 L62 42 L62 58 L74 58 L50 82 L26 58 L38 58 L38 42 L26 42 Z" />
      </g>
    </svg>
  );
}
