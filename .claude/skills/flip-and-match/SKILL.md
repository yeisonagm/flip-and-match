---
name: flip-and-match
description: Build and modify features in the Flip & Match codebase — a React 19 + TypeScript + Tauri v2 memory game about Peruvian tourist destinations, designed for touch whiteboards. Use this skill for ANY work in this repository: adding cards or places, changing game rules, building UI components, touching the board layout, wiring persistence, adjusting fullscreen behavior, writing tests, or fixing bugs. Also use it when the user mentions the memory game, the board, the card flip, the leaderboard, levels, or the .exe build, even if they don't name the project. The codebase has non-obvious constraints (zero-scroll layout, simultaneous touch handling, relative asset paths) that silently break if you don't follow the conventions here.
---

# Flip & Match

Educational memory game. 20 Peruvian tourist destinations, three difficulty levels,
runs on a touch whiteboard as a packaged `.exe` and as a static web build.

`IMPLEMENTATION_PLAN.md` at the repo root is the source of truth for scope and rationale.
This skill is the operational layer: where code goes, how it's written, and what to verify.

---

## Read this first: the five silent failures

These break the product without throwing an error. Check them on every change.

**1. Absolute asset paths.** `base: './'` must stay in `vite.config.ts`, and every asset
reference must be relative (`./images/places/x.webp`). An absolute path works perfectly in
`pnpm dev` and fails only in the packaged `.exe`, where nobody looks until release day.

**2. Missing `min-height: 0`.** A flex child defaults to `min-height: auto`, so it refuses
to shrink below its content and pushes the board out of the viewport. This is the number
one cause of scrollbars in this codebase, and scrollbars are a release blocker.

**3. Game logic outside the reducer.** All state transitions go through
`gameReducer.ts`. Logic in a component means the simultaneous-touch guard doesn't cover it.

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

| The task                                  | Where it goes                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| A new tourist place                       | `features/catalog/places.data.ts` + a `.webp` in `public/images/places/` |
| A game rule, timing, or state transition  | `features/memory-game/domain/gameReducer.ts`                             |
| The score formula                         | `features/memory-game/domain/scoring.ts`                                 |
| Deck composition, randomization           | `features/memory-game/domain/buildDeck.ts`                               |
| A new difficulty level                    | `features/memory-game/config/levels.ts`                                  |
| Board sizing, grid, card aspect           | `features/memory-game/components/Board.tsx` + `styles/index.css`         |
| Card visuals, flip, caption               | `features/memory-game/components/CardItem.tsx`                           |
| Timer, score, lives indicator, level exit | `features/memory-game/components/GameSidebar.tsx`                        |
| Victory or defeat modal content           | `features/memory-game/components/VictoryModal.tsx` / `DefeatModal.tsx`   |
| Saving or reading scores                  | `features/leaderboard/infra/localStorageScoreRepository.ts`              |
| Ranking or Top-N rules                    | `features/leaderboard/domain/ranking.ts`                                 |
| Fullscreen, window, anything OS-level     | `platform/fullscreen/`                                                   |
| A reusable button, modal, tabs            | `shared/ui/`                                                             |
| Any Spanish text                          | `shared/copy/es.ts`                                                      |
| A new screen                              | `app/screens/` + extend the `Screen` union in `app/types.ts`             |

### Dependency rule

```
app/  ──►  features/  ──►  shared/
                │
                └────────►  platform/
```

- `domain/` imports nothing from the project except its own types. No React, ever.
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

Comments explain **why**, never **what**. The code already says what it does.

Write a comment only in these four cases:

1. A non-obvious constraint is being satisfied
2. A guard prevents a real bug
3. A magic number has a reason
4. A `ports/` interface needs its responsibility stated (one or two lines)

```ts
// Good — explains a constraint the reader cannot infer
// min-height:0 lets this flex child shrink below its content size

// Good — explains a guard
// reject non-primary pointers: touch boards fire simultaneous taps

// Good — explains a number
// 900ms: players need longer to memorize on a wall-sized display

// Bad — restates the line
// increment the miss counter
misses += 1;
```

Never write: JSDoc `@param` blocks on internal functions, section banners
(`// ===== HELPERS =====`), commented-out code, or bare `TODO`s.

**Target density: at most one comment per 15–20 lines.** If every function has a comment
above it, delete half of them.

### TypeScript

- `strict: true` and `noUncheckedIndexedAccess: true`.
- **`any` is banned.** Use `unknown` plus a type guard.
- No `as` assertions except `as const`. An `as Foo` almost always means the type is modeled
  wrong — fix the model instead.
- Discriminated unions for state, never loose booleans. `status: 'PREVIEW' | 'PLAYING' | ...`
  makes invalid states unrepresentable; `isPreview` + `isPlaying` + `isEvaluating` does not.
- `readonly` on props and domain shapes.
- `as const satisfies` for static config, `interface` for object shapes, `type` for unions.

### React 19

- No `useMemo`, `useCallback` or `React.memo`. React Compiler handles it.
- `useReducer` for game state. `useState` only for trivial local UI state.
- Components are pure: no mutation during render, no refs read during render.
- Split any component file that passes ~150 lines.
- Every `setInterval` and `addEventListener` returns its cleanup from the effect. Leaking
  a timer across level changes is the most common bug in this codebase.

### Interactive elements

Cards and controls are `<button>`, never `<div onClick>`. That gives focus, keyboard
activation and semantics for free — and this app may be operated with a keyboard when no
touch is available.

---

## Touch whiteboard rules

The target is a wall-mounted touch display. These are not optional.

**Simultaneous taps.** Two fingers hit two cards in the same frame. Guard at both levels:

```tsx
// event level
<button
  onPointerDown={(e) => {
    if (!e.isPrimary) return;
    onSelect(card.instanceId);
  }}
/>
```

```ts
// reducer level — this is the real defense
if (state.status !== "PLAYING") return state;
if (state.flipped.length >= 2) return state;
if (card.isFlipped || card.isMatched) return state;
```

React queues dispatches, so the reducer sees the second selection against the state the
first one already produced. Separate `useState` calls would both read stale state and let
three cards flip. This is why all game state lives in one reducer.

**No `:hover`.** On touch, hover sticks and leaves phantom highlighted cards. Use `:active`
and a press transform.

**Browser gestures off.**

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
```

**Minimum target size 64×64 px.** On a 75-inch display that is still physically small.

---

## The zero-scroll layout contract

Pure CSS. No JavaScript, no `ResizeObserver`. Do not replace this with a measuring hook.

```css
.app-shell {
  height: 100dvh;
  display: flex;
  overflow: hidden;
}
.sidebar {
  flex: 0 0 clamp(180px, 16vw, 300px);
}
.board-area {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: grid;
  place-items: center;
}
.board {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  aspect-ratio: var(--cols) / var(--rows);
  max-width: 100%;
  max-height: 100%;
  gap: clamp(0.25rem, 1vmin, 1.25rem);
}
```

`aspect-ratio` plus both `max-*: 100%` constraints makes the board size itself against
whichever dimension is tighter; `place-items: center` handles the leftover. It never
overflows at any resolution without measuring anything.

**All text scales with `clamp()` and `vmin`**, never fixed `px`. The same interface runs on
a 1024×600 laptop and a 4K wall display.

**The card caption is absolutely positioned**, never in flow. If it entered the flow on
match, the card would change height and the whole grid would jump.

```css
.card-caption {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  transform: translateY(100%);
  transition: transform 320ms var(--flip-ease);
}
.card[data-matched="true"] .card-caption {
  transform: translateY(0);
}
```

---

## Design tokens

Defined in `styles/index.css` under `@theme`. Use the token, never a raw hex.

| Token               | Value               | Use                             |
| ------------------- | ------------------- | ------------------------------- |
| `--color-ink`       | `#10162C`           | base background                 |
| `--color-stone`     | `#1C2444`           | sidebar, modal surfaces         |
| `--color-gold`      | `#E8B33D`           | matches, score, primary accent  |
| `--color-cochineal` | `#C7383F`           | misses, destructive actions     |
| `--color-lagoon`    | `#2E9B8F`           | secondary accent, confirmations |
| `--color-bone`      | `#F2EDE3`           | primary text                    |
| `--font-display`    | Bricolage Grotesque | headings, place names, timer    |
| `--font-body`       | Inter Tight         | UI, buttons, tables             |

Fonts are self-hosted `.woff2` in `public/fonts/`. **Never add a `fonts.googleapis.com`
link** — the app must work with no network.

Timer and score need `font-variant-numeric: tabular-nums`. Without it the digits change
width and the clock visibly jitters on a large display.

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Recipes

### Add a dependency

```bash
pnpm add <package>          # runtime dependency
pnpm add -D <package>       # dev dependency
```

Never `npm install <package>` — it writes a `package-lock.json` alongside
`pnpm-lock.yaml` and the two trees drift. If unsure whether a package is already
installed, check `package.json` first rather than reinstalling.

### Add a tourist place

1. Export the image as **WebP, 1000 px on the long side, quality 80** (~130 KB). Not PNG,
   not 1080 px — cards render at ~370 px even on a 4K board, so anything larger only bloats
   the `.exe`.
2. Save it as `public/images/places/<kebab-case-id>.webp`.
3. Append to `features/catalog/places.data.ts`:

```ts
{ id: 'kuelap', name: 'Kuélap', imageUrl: './images/places/kuelap.webp' },
```

The `id` and the filename must match. No other file changes — `buildDeck` picks a random
subset from whatever the catalog holds.

### Add or change a level

Edit `features/memory-game/config/levels.ts` only:

```ts
export const LEVELS = {
  easy: { label: "Fácil", cols: 4, rows: 3, pairs: 6 },
  medium: { label: "Medio", cols: 4, rows: 4, pairs: 8 },
  hard: { label: "Difícil", cols: 5, rows: 4, pairs: 10 },
} as const satisfies Record<LevelId, LevelConfig>;
```

Two invariants: `cols * rows === pairs * 2`, and `cols > rows` — the target is a 16:9
landscape display where height is the scarce dimension, so a portrait grid wastes half the
width and shrinks every card.

Adding a level id also requires a new `localStorage` key and a new tab in
`LeaderboardTable`. Both derive from `LEVELS`, so iterate over it rather than hardcoding.

### Change a game rule

Only `gameReducer.ts`, then update the tests in `domain/__tests__/`. Never patch a rule in
a component or a hook — that path bypasses the touch guards.

Current timings, and why:

- `PREVIEW`: 1500 ms
- match lockout: 600 ms (matches the caption entrance animation)
- miss lockout: 900 ms (viewers stand far from a wall display and need the extra time)

**Lives:** `MAX_LIVES = 3`, fixed across all levels — it's a proxy for attention, not for
board difficulty, so it doesn't scale with `pairs`. A miss decrements `livesRemaining`
inside the same `RESOLVE_PAIR` transition that flips the cards back, and the full 900ms
lockout still plays before moving to `DEFEAT` — the player needs to see the mistake that
ended the run, not have the board freeze mid-animation. `status` is `'VICTORY' | 'DEFEAT'`,
two separate discriminants, not one `FINISHED` state plus a boolean — see §14's rule on
discriminated unions. `DEFEAT` always wins the race against `VICTORY`: if the last miss
also happens to be on the last unmatched pair, the state is `DEFEAT`, never `VICTORY` by
default. Check this ordering explicitly whenever touching `RESOLVE_PAIR`.

### Add a screen

1. Extend the union in `app/types.ts`: `type Screen = 'MENU' | 'GAME' | 'SCORES' | 'NEW'`
2. Add `app/screens/NewScreen.tsx`
3. Add the case to the switch in `App.tsx`

No router. Three-to-four screens do not justify one, and a switch behaves identically in
the browser and inside the Tauri WebView.

### Touch anything OS-level

Go through `platform/`. Never call a Tauri API from a component — the web build would
crash. Add a port interface, two implementations, and detect the environment:

```ts
const isTauri = "__TAURI_INTERNALS__" in window;
```

Any new Tauri capability also needs its permission in
`src-tauri/capabilities/default.json`, or the call fails at runtime with no compile error.

### Add persistence

Extend `ScoreRepository` (the port), then the localStorage implementation. Components talk
to the interface only. That is what keeps a future move to `tauri-plugin-store` from
touching the UI.

Use `shared/lib/createId.ts`, not `crypto.randomUUID()` directly — the latter is
`undefined` outside secure contexts, which is exactly what happens when the web build is
served over plain HTTP on a school LAN.

---

## Testing

Test `features/*/domain/` only. It is pure TypeScript, runs in milliseconds, and holds
everything that can break silently. No component tests in this project.

```bash
pnpm vitest run
```

When changing `gameReducer.ts`, these cases must stay green:

- `SELECT_CARD` during `PREVIEW` or `EVALUATING` returns the state unchanged
- a third card is rejected
- an already-flipped or already-matched card is rejected
- `SELECT_CARD` during `VICTORY` or `DEFEAT` is rejected
- a matching pair increments `matches`, not `misses`, and doesn't touch `livesRemaining`
- a non-matching pair increments `misses`, decrements `livesRemaining` by 1, and re-hides
  both cards
- missing with `livesRemaining === 1` transitions to `DEFEAT`
- matching the final pair with lives remaining transitions to `VICTORY`
- the edge case: a miss that both empties the last life and would have been the final
  pair still resolves to `DEFEAT`, never `VICTORY`

When changing `buildDeck.ts`:

- returns exactly `pairs * 2` cards
- every `place.id` appears exactly twice
- all `instanceId` values are unique
- does not repeat the previous deck when the catalog allows it

Randomization uses Fisher-Yates in `shared/lib/shuffle.ts`. Never replace it with
`sort(() => Math.random() - 0.5)` — that is biased and undefined behavior in some engines.

---

## Definition of done

Before reporting a task complete:

```bash
pnpm biome check --write .   # lint + format
pnpm tsc --noEmit            # types
pnpm vitest run              # domain tests
pnpm build                   # web build
```

Then verify by hand, because these three do not show up in any command:

1. **Resize the window from 1024×600 to full screen. No scrollbar appears.** This is the
   single most important check in the project.
2. If assets or config changed, run `pnpm tauri build` and open the actual `.exe`. The dev
   server hides broken relative paths.
3. If the change touched interaction, tap two cards at once. Only one flips.
