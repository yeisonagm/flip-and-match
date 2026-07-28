import type { LevelId } from "@/features/memory-game";

// With data attached, not a bare string union: MENU + levelId would otherwise be a
// representable-but-impossible state with a parallel useState.
export type Screen =
  | { readonly kind: "MENU" }
  | { readonly kind: "GAME"; readonly levelId: LevelId }
  | { readonly kind: "SCORES" };
