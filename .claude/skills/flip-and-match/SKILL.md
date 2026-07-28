---
name: flip-and-match
description: Build and modify features in the Flip & Match codebase — a React 19 + TypeScript + Tauri v2 memory game about Peruvian tourist destinations, designed for touch whiteboards. Use this skill for ANY work in this repository: adding cards or places, changing game rules, building UI components, touching the board layout, wiring persistence, adjusting fullscreen behavior, writing tests, or fixing bugs. Also use it when the user mentions the memory game, the board, the card flip, the leaderboard, levels, or the .exe build, even if they don't name the project. The codebase has non-obvious constraints (zero-scroll layout, simultaneous touch handling, relative asset paths, missing-image fallback) that silently break if you don't follow the conventions here.
---

# Flip & Match

Educational memory game. Peruvian tourist destinations, three difficulty levels, runs on a
touch whiteboard as a packaged `.exe` and as a static web build.

`IMPLEMENTATION_PLAN.md` at the repo root is the source of truth for scope, architecture and
rationale. This skill is the operational layer: where code goes, how it's written, and what
to verify. Do not duplicate the plan's tables or CSS blocks here — point to it instead, so
the two never drift apart.

---

## Read this first: the six silent failures

These break the product without throwing an error. Check them on every change.

**1. Absolute asset paths.** `base: './'` must stay in `vite.config.ts`, and every asset
reference must be relative (`./images/places/x.webp`). An absolute path works perfectly in
`pnpm dev` and fails only in the packaged `.exe`, where nobody looks until release day.
Fonts are the same trap in reverse: they must be **imported from `src/`**, never copied into
`public/fonts/` — a font referenced from a hashed CSS file resolves against `/assets/`, not
the root, and 404s only inside the package.

**2. Missing `min-width`/`min-height: 0`.** A flex or grid child defaults to `auto`, so it
refuses to shrink below its content and pushes the board out of its box. `overflow: hidden`
on `.app-shell` then hides this as **silent clipping**, not a scrollbar — a cut-off bottom
row looks like a design choice until someone notices on the real whiteboard. See
`IMPLEMENTATION_PLAN.md` §10 for the full contract.

**3. Game logic outside the reducer.** All state transitions go through `gameReducer.ts`.
Logic in a component means the simultaneous-touch guard and the settings injection (below)
don't cover it.

**4. Manual memoization.** React Compiler is enabled. Writing `useMemo`, `useCallback` or
`React.memo` fights the compiler's analysis and can produce worse output than nothing.

**5. Spanish strings in components.** All visible text lives in `src/shared/copy/es.ts`.
Code stays monolingual.

**6. A stray `package-lock.json` or `yarn.lock`.** This project uses **pnpm only**. If one
of those files appears (usually from someone running plain `npm install` out of habit), it
silently creates a second, divergent dependency tree. Delete it and reinstall with
`pnpm install`. Never run `npm install` or `yarn add` in this repo.

---

## Where things go

Match the request to a location before writing anything.

| The task                                  | Where it goes                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| A new tourist place                       | `features/catalog/places.data.ts` + a `.webp` in `public/images/places/`       |
| A game rule, timing, or state transition  | `features/memory-game/domain/gameReducer.ts`                                   |
| Default preview/lives/lockout values      | `features/memory-game/config/gameSettings.ts` — never a literal in the reducer |
| The score formula                         | `features/memory-game/domain/scoring.ts`                                       |
| Ranking / Top-20 / tie-break              | `features/leaderboard/domain/ranking.ts`                                       |
| Deck composition, randomization           | `features/memory-game/domain/buildDeck.ts`                                     |
| A new difficulty level                    | `features/memory-game/config/levels.ts`                                        |
| Board sizing, grid, card aspect           | `features/memory-game/components/Board.tsx` + `styles/index.css`               |
| Card visuals, flip, caption               | `features/memory-game/components/CardItem.tsx`                                 |
| Missing-image fallback                    | `shared/ui/PlaceImage.tsx` + `shared/ui/PlacePlaceholder.tsx`                  |
| Timer, score, lives indicator, level exit | `features/memory-game/components/GameSidebar.tsx`                              |
| Victory or defeat modal content           | `features/memory-game/components/VictoryModal.tsx` / `DefeatModal.tsx`         |
| Saving or reading scores                  | `features/leaderboard/infra/localStorageScoreRepository.ts`                    |
| Fullscreen, window, anything OS-level     | `platform/fullscreen/`                                                         |
| Service worker, offline cache, install prompt | `platform/pwa/` (web build only — no-ops inside Tauri)                     |
| A reusable button, modal, tabs            | `shared/ui/`                                                                   |
| Any Spanish text                          | `shared/copy/es.ts`                                                            |
| A new screen                              | `app/screens/` + extend the `Screen` union in `app/types.ts`                   |

### Dependency rule

```
app/  ──►  features/  ──►  shared/
                │
                └────────►  platform/
```

- `domain/` imports nothing from the project except its own types (`import type` only —
  `verbatimModuleSyntax` makes this checkable, not just conventional). No React, ever.
- Features never import each other. If two need the same thing, promote it to `shared/`.
- Import features through their `index.ts` barrel. Reaching into another feature's
  internals is a review failure.

---

## Code conventions

### Language

Code, identifiers, filenames, comments and commit messages: **English**.
User-visible text: **Spanish**, and only in `shared/copy/es.ts`.
Repo documentation: Spanish.

### Comments

Comments explain **why**, never **what**. Write one only in these four cases: a non-obvious
constraint is being satisfied, a guard prevents a real bug, a magic number has a reason, or a
`ports/` interface needs its responsibility stated. Never JSDoc `@param` on internal
functions, section banners, commented-out code, or bare `TODO`s. Target density: at most one
comment per 15–20 lines.

### TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `verbatimModuleSyntax: true` — no
  exceptions. Any array/index access is `T | undefined`; guard it explicitly.
- **`any` is banned.** Use `unknown` plus a type guard.
- No `as` assertions except `as const`. An `as Foo` almost always means the type is modeled
  wrong — fix the model instead.
- Discriminated unions for state, never loose booleans, and never a nullable field that's
  only meaningful in one branch (e.g. a `pendingOutcome` field is the smell this rule bans).
- `readonly` on props and domain shapes.
- `satisfies` for static config, `interface` for object shapes, `type` for unions.

### React 19

- No `useMemo`, `useCallback` or `React.memo`. React Compiler handles it.
- `useReducer` for game state, seeded via the `START` action's `settings` payload — the
  reducer itself never imports `config/gameSettings.ts`. `useState` only for trivial local UI
  state (e.g. `previousPlaceIds` between games).
- Components are pure: no mutation during render, no refs read during render.
- Split any component file that passes ~150 lines.
- Every `setInterval`/`setTimeout` and `addEventListener` returns its cleanup from the
  effect. Leaking a timer across level changes is the most common bug in this codebase.

### Interactive elements

Cards and controls are `<button>`, never `<div onClick>` — but a `<button>` wired only to
`onPointerDown` is _not_ keyboard-accessible (Enter/Space never fire pointer events). Wire
both: `onPointerDown` (guarded by `e.isPrimary`, with `preventDefault()` to suppress the
synthetic click) plus `onClick` filtered by `e.detail === 0` for the keyboard path.

Both faces of a card stay in the accessibility tree at all times — `backface-visibility` is
paint-only. Keep `aria-label` generic ("Carta oculta") while `isFlipped === false`, on both
the real image and the placeholder; a fixed `alt={place.name}` leaks the pair to any screen
reader before the card is even flipped.

---

## Touch whiteboard rules

The target is a wall-mounted touch display, operable by keyboard when touch isn't available.

**Simultaneous taps.** Two fingers hit two cards in the same frame. The reducer rejects the
impossible transition — this is the real defense, not the event guard:

```ts
if (state.status !== "PLAYING") return state;
if (state.flipped.length >= 2) return state;
if (card.isFlipped || card.isMatched) return state;
```

React queues dispatches, so the reducer sees the second selection against the state the
first one already produced. Separate `useState` calls would both read stale state and let
three cards flip.

**No `:hover`.** On touch, hover sticks and leaves phantom highlighted cards. Use `:active`
and a press transform.

**Browser gestures off, including pinch-zoom on the board itself** — a two-finger gesture on
a whiteboard zooms the WebView and there's no browser chrome to undo it:

```css
html {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.card,
.btn {
  user-select: none;
  -webkit-touch-callout: none;
}
.board {
  touch-action: none;
} /* manipulation alone still allows pinch-zoom here */
```

Pair this with `"zoomHotkeysEnabled": false` on the Tauri window.

**Minimum target size 64×64 px.** On a 75-inch display that is still physically small.

---

## The zero-scroll layout contract

Pure CSS. No JavaScript, no `ResizeObserver`. Full contract and the reasoning behind each
line are in `IMPLEMENTATION_PLAN.md` §10 — do not re-derive it here, and do not treat "no
scrollbar" as the success criterion: `.app-shell` uses `overflow: clip`, so a broken layout
clips silently instead of scrolling. The real criterion is "the bottom row of cards is fully
visible."

Key points to remember while coding:

- `.board`'s cell size is computed directly (`min()` of the width-limited and height-limited
  candidates, gaps subtracted), not derived from `aspect-ratio` — an aspect-ratio ignores
  gaps and leaves the board slightly taller than its square contents.
- `.board-area` needs `container-type: size` so the cell-size formula's `cqw`/`cqh` units are
  driven by the flex layout, never by the board's own content.
- Every flex/grid child in the chain needs explicit `min-width: 0; min-height: 0`.
- The card caption is **absolutely positioned**, never in flow. If it entered the flow on
  match, the card would change height and the whole grid would jump.

---

## Design tokens

Defined in `styles/index.css` under `@theme`. Use the token, never a raw hex — see
`IMPLEMENTATION_PLAN.md` §9 for the full palette and rationale.

Fonts are self-hosted via `@fontsource-variable/*`, imported from `src/` — never
`fonts.googleapis.com`, never copied to `public/fonts/` (see silent failure #1).

Timer and score need `font-variant-numeric: tabular-nums`, or the digits change width and
the clock visibly jitters on a large display. Respect `prefers-reduced-motion`.

---

## Recipes

### Add a dependency

```bash
pnpm add <package>          # runtime dependency
pnpm add -D <package>       # dev dependency
```

Never `npm install <package>` — it writes a `package-lock.json` alongside `pnpm-lock.yaml`
and the two trees drift.

### Add a tourist place

1. Export the image as **WebP, 1000 px on the long side, quality 80** (~130 KB). Cards
   render at ~370 px even on a 4K board, so anything larger only bloats the `.exe`.
2. Save it as `public/images/places/<kebab-case-id>.webp`.
3. Append to `features/catalog/places.data.ts` with a matching `id`.

If the file is missing, `PlaceImage` falls back to a generated placeholder automatically —
the game stays playable and every place still looks distinct. No other file changes needed;
`buildDeck` picks a random subset from whatever the catalog holds. See
`IMPLEMENTATION_PLAN.md` §19–§20 for the fallback design and the pairing invariant.

### Add or change a level

Edit `features/memory-game/config/levels.ts` only. Two invariants, both covered by domain
tests: `cols * rows === pairs * 2`, and `cols > rows` (16:9 landscape target — height is the
scarce dimension). Adding a level id also needs a new `localStorage` key and a new tab in
`LeaderboardTable`; both should iterate over `LEVELS` rather than hardcode ids.

### Change a game rule or a default setting

Rule logic: only `gameReducer.ts`, then update `domain/__tests__/`. Never patch a rule in a
component or a hook — that path bypasses the touch guards.

Default values (preview on/off and duration, `maxLives`, lockout durations): only
`config/gameSettings.ts`. `maxLives: number | null` — `null` means unlimited lives, no
`DEFEAT` ever. `livesRemaining` is **not** a state field; it's a selector
(`domain/lives.ts`) derived from `misses` and `settings.maxLives`, so it can't desync.

The lockout after a pair is split into `EVALUATING_MATCH` (600ms default) and
`EVALUATING_MISS` (900ms default) — two distinct statuses, not one `EVALUATING` plus a
pending-outcome field, because the hook has to know the duration the instant the status is
set, and `SELECT_CARD` already knows the outcome by then. `DEFEAT` is checked before
`VICTORY` when resolving a miss: a miss that empties the last life never resolves to victory,
even if it was also the final pair.

**Only wins get saved.** The victory modal offers a name + save; the defeat modal shows the
same run summary (lives lost, matches, misses, time, score) with no save option.

### Add a screen

1. Extend the union in `app/types.ts`, with data where needed:
   `type Screen = { kind: 'MENU' } | { kind: 'GAME'; levelId: LevelId } | { kind: 'SCORES' }`
2. Add `app/screens/NewScreen.tsx`.
3. Add the case to the switch in `App.tsx`.

No router. A `switch` behaves identically in the browser and inside the Tauri WebView.

### Touch anything OS-level

Go through `platform/`. Never call a Tauri API from a component — the web build would crash.
Add a port interface, two implementations, and detect the environment:

```ts
const isTauri = "__TAURI_INTERNALS__" in window;
```

Any new Tauri capability also needs its permission in `src-tauri/capabilities/default.json`,
or the call fails at runtime with no compile error.

### Add persistence

`ScoreRepository` is **async** end to end (`load`/`save` return Promises) — it exists so a
future swap to `tauri-plugin-store` doesn't touch a single component, and that plugin's API
is Promise-based. Ranking (sort order, tie-break, the Top-20 cap) lives in
`domain/ranking.ts`, not in the repository — it's a pure rule, tested once, shared by every
adapter. The localStorage adapter must degrade to `[]` on corrupted JSON, a quota error, or a
blocked storage context — never let a bad key crash the Scores screen.

Use `shared/lib/createId.ts` for `ScoreEntry.id`, not `crypto.randomUUID()` directly — the
latter is `undefined` outside secure contexts, which happens when the web build is served
over plain HTTP on a school LAN. Card `instanceId`s don't need it; they're derived from
`place.id` (`` `${place.id}#0` ``/`` `#1` ``), unique by construction.

---

## Testing

Test `features/*/domain/` only. It is pure TypeScript, runs in milliseconds, and holds
everything that can break silently. No component tests in this project. `vitest.config.ts` is
separate from `vite.config.ts` (no React Compiler babel pass, no Tailwind plugin, for tests
that never touch either).

```bash
pnpm test
```

Full case list lives in `IMPLEMENTATION_PLAN.md` §15 — keep it in sync there, not here.
Highlights when touching `gameReducer.ts`: both `EVALUATING_MATCH` and `EVALUATING_MISS`
reject `SELECT_CARD`; `maxLives: null` never reaches `DEFEAT`; a miss that empties the last
life resolves to `DEFEAT` even if it was the final pair. When touching `buildDeck.ts` or
`places.data.ts`: every place appears exactly twice, never three-of-one-and-one-of-another,
and the catalog has enough entries for the hardest level's pair count.

Randomization uses decorate-sort-undecorate in `shared/lib/shuffle.ts`, with the RNG
injected for deterministic tests. Never `sort(() => Math.random() - 0.5)` directly, and never
the classic Fisher-Yates in-place swap — it doesn't compile under `noUncheckedIndexedAccess`.

---

## Definition of done

Before reporting a task complete:

```bash
pnpm biome check --write .   # lint + format
pnpm tsc -b --noEmit         # types
pnpm test                    # domain tests
pnpm build                   # web build
```

Then verify by hand, because these do not show up in any command:

1. **Resize the window from 1024×600 to full screen. The bottom row of cards is always fully
   visible.** This is the single most important check in the project — `.app-shell` clips
   silently, so a scrollbar's absence proves nothing on its own.
2. If assets or config changed, run `pnpm tauri build` and open the actual `.exe`. The dev
   server hides broken relative paths.
3. If the change touched interaction, tap two cards at once (only one flips) and tab through
   the board by keyboard (Enter/Space selects a card).
4. If the change touched images, empty `public/images/places/` and confirm the game is still
   fully playable via the generated placeholder.
