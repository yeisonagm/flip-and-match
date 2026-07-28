import { describe, expect, it } from "vitest";
import { createInitialState } from "../createInitialState";
import { gameReducer } from "../gameReducer";
import { livesRemaining } from "../lives";
import type { Card, GameSettings, GameState } from "../types";

const SETTINGS: GameSettings = {
  preview: { enabled: true, durationMs: 1500 },
  maxLives: 3,
  matchLockoutMs: 600,
  missLockoutMs: 900,
};

const place = (id: string) => ({
  id,
  name: id,
  imageUrl: `./${id}.webp`,
  location: "Test",
  description: ["A", "B"] as const,
});

const makeCards = (): readonly Card[] => [
  { instanceId: "a#0", place: place("a"), isFlipped: false, isMatched: false },
  { instanceId: "a#1", place: place("a"), isFlipped: false, isMatched: false },
  { instanceId: "b#0", place: place("b"), isFlipped: false, isMatched: false },
  { instanceId: "b#1", place: place("b"), isFlipped: false, isMatched: false },
];

const start = (settings: GameSettings = SETTINGS, now = 0): GameState =>
  gameReducer(createInitialState(settings), {
    type: "START",
    cards: makeCards(),
    levelId: "easy",
    settings,
    now,
  });

const selectTwo = (state: GameState, first: string, second: string): GameState =>
  gameReducer(gameReducer(state, { type: "SELECT_CARD", instanceId: first }), {
    type: "SELECT_CARD",
    instanceId: second,
  });

const resolve = (state: GameState, now = 0): GameState =>
  gameReducer(state, { type: "RESOLVE_PAIR", now });

describe("gameReducer", () => {
  it("rejects SELECT_CARD during PREVIEW", () => {
    const state = start();
    const next = gameReducer(state, { type: "SELECT_CARD", instanceId: "a#0" });
    expect(next).toBe(state);
  });

  it("rejects SELECT_CARD during EVALUATING_MATCH", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const evaluating = selectTwo(playing, "a#0", "a#1");
    expect(evaluating.status).toBe("EVALUATING_MATCH");
    const next = gameReducer(evaluating, { type: "SELECT_CARD", instanceId: "b#0" });
    expect(next).toBe(evaluating);
  });

  it("rejects SELECT_CARD during EVALUATING_MISS", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const evaluating = selectTwo(playing, "a#0", "b#0");
    expect(evaluating.status).toBe("EVALUATING_MISS");
    const next = gameReducer(evaluating, { type: "SELECT_CARD", instanceId: "a#1" });
    expect(next).toBe(evaluating);
  });

  it("rejects SELECT_CARD during VICTORY", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const afterFirstMatch = resolve(selectTwo(playing, "a#0", "a#1"));
    const won = resolve(selectTwo(afterFirstMatch, "b#0", "b#1"));
    expect(won.status).toBe("VICTORY");
    const next = gameReducer(won, { type: "SELECT_CARD", instanceId: "a#0" });
    expect(next).toBe(won);
  });

  it("rejects SELECT_CARD during DEFEAT", () => {
    const oneLife: GameSettings = { ...SETTINGS, maxLives: 1 };
    const playing = gameReducer(start(oneLife), { type: "END_PREVIEW", now: 100 });
    const dead = resolve(selectTwo(playing, "a#0", "b#0"));
    expect(dead.status).toBe("DEFEAT");
    const next = gameReducer(dead, { type: "SELECT_CARD", instanceId: "a#1" });
    expect(next).toBe(dead);
  });

  it("rejects a third card once two are already flipped", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const twoFlipped: GameState = {
      ...playing,
      flipped: ["a#0", "b#0"],
      cards: playing.cards.map((c) =>
        c.instanceId === "a#0" || c.instanceId === "b#0" ? { ...c, isFlipped: true } : c,
      ),
    };
    const next = gameReducer(twoFlipped, { type: "SELECT_CARD", instanceId: "a#1" });
    expect(next).toBe(twoFlipped);
  });

  it("rejects an already-flipped card", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const afterFirst = gameReducer(playing, { type: "SELECT_CARD", instanceId: "a#0" });
    const next = gameReducer(afterFirst, { type: "SELECT_CARD", instanceId: "a#0" });
    expect(next).toBe(afterFirst);
  });

  it("rejects an already-matched card", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const matched = resolve(selectTwo(playing, "a#0", "a#1"));
    expect(matched.status).toBe("PLAYING");
    const next = gameReducer(matched, { type: "SELECT_CARD", instanceId: "a#0" });
    expect(next).toBe(matched);
  });

  it("a matching pair increments matches, not misses, and marks both cards immediately", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const evaluating = selectTwo(playing, "a#0", "a#1");
    expect(evaluating.status).toBe("EVALUATING_MATCH");
    expect(evaluating.matches).toBe(1);
    expect(evaluating.misses).toBe(0);
    expect(evaluating.cards.filter((c) => c.isMatched)).toHaveLength(2);
  });

  it("a non-matching pair increments misses immediately; RESOLVE_PAIR re-hides both cards", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const evaluating = selectTwo(playing, "a#0", "b#0");
    expect(evaluating.status).toBe("EVALUATING_MISS");
    expect(evaluating.misses).toBe(1);
    expect(evaluating.cards.find((c) => c.instanceId === "a#0")?.isFlipped).toBe(true);

    const resolved = resolve(evaluating);
    expect(resolved.status).toBe("PLAYING");
    expect(resolved.cards.every((c) => !c.isFlipped)).toBe(true);
  });

  it("reaches DEFEAT only on the miss that empties the last life, not before", () => {
    let state = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    state = resolve(selectTwo(state, "a#0", "b#0")); // miss 1/3
    expect(state.status).toBe("PLAYING");
    state = resolve(selectTwo(state, "a#0", "b#0")); // miss 2/3
    expect(state.status).toBe("PLAYING");
    expect(livesRemaining(state)).toBe(1);
    state = resolve(selectTwo(state, "a#0", "b#0")); // miss 3/3
    expect(state.status).toBe("DEFEAT");
  });

  it("never reaches DEFEAT with unlimited lives", () => {
    const unlimited: GameSettings = { ...SETTINGS, maxLives: null };
    let state = gameReducer(start(unlimited), { type: "END_PREVIEW", now: 100 });
    for (let i = 0; i < 10; i++) {
      state = resolve(selectTwo(state, "a#0", "b#0"));
      expect(state.status).not.toBe("DEFEAT");
    }
    expect(livesRemaining(state)).toBeNull();
  });

  it("matching the final pair with lives remaining reaches VICTORY", () => {
    let state = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    state = resolve(selectTwo(state, "a#0", "a#1"));
    expect(state.status).toBe("PLAYING");
    state = resolve(selectTwo(state, "b#0", "b#1"));
    expect(state.status).toBe("VICTORY");
  });

  it("a miss that empties the last life resolves to DEFEAT even if pairs remain unmatched", () => {
    const oneLife: GameSettings = { ...SETTINGS, maxLives: 1 };
    const cards: readonly Card[] = [
      ...makeCards(),
      { instanceId: "c#0", place: place("c"), isFlipped: false, isMatched: false },
      { instanceId: "c#1", place: place("c"), isFlipped: false, isMatched: false },
    ];
    let state = gameReducer(createInitialState(oneLife), {
      type: "START",
      cards,
      levelId: "easy",
      settings: oneLife,
      now: 0,
    });
    state = gameReducer(state, { type: "END_PREVIEW", now: 100 });
    state = resolve(selectTwo(state, "a#0", "a#1")); // matched, one pair left unresolved (c)
    expect(state.status).toBe("PLAYING");
    state = resolve(selectTwo(state, "b#0", "c#0")); // miss, empties the last life
    expect(state.status).toBe("DEFEAT");
    expect(state.cards.some((c) => !c.isMatched && !c.isFlipped)).toBe(true);
  });

  it("livesRemaining never drops below 0", () => {
    const oneLife: GameSettings = { ...SETTINGS, maxLives: 1 };
    const state = resolve(
      selectTwo(gameReducer(start(oneLife), { type: "END_PREVIEW", now: 100 }), "a#0", "b#0"),
    );
    expect(state.status).toBe("DEFEAT");
    expect(livesRemaining(state)).toBe(0);
  });

  it("with preview disabled, START goes straight to PLAYING with startedAt already set", () => {
    const noPreview: GameSettings = { ...SETTINGS, preview: { enabled: false, durationMs: 1500 } };
    const state = start(noPreview, 42);
    expect(state.status).toBe("PLAYING");
    expect(state.startedAt).toBe(42);
    expect(state.cards.every((c) => !c.isFlipped)).toBe(true);
  });

  it("END_PREVIEW outside PREVIEW is a no-op", () => {
    const playing = gameReducer(start(), { type: "END_PREVIEW", now: 100 });
    const next = gameReducer(playing, { type: "END_PREVIEW", now: 200 });
    expect(next).toBe(playing);
  });
});
