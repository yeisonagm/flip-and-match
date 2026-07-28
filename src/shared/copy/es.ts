// All visible Spanish text lives here — nothing in a component. See SKILL.md silent
// failure #5.
export const copy = {
  menu: {
    title: "Flip & Match",
    subtitle: "Memoria de lugares turísticos del Perú",
    play: (levelLabel: string): string => `Jugar ${levelLabel}`,
    scores: "Ver puntajes",
    fullscreen: "Pantalla completa",
  },
  game: {
    exit: "Salir",
    hiddenCard: "Carta oculta",
    time: "Tiempo",
    score: "Puntaje",
    lives: "Vidas",
    unlimitedLives: "∞",
  },
  victory: {
    title: "¡Nivel completado!",
    subtitle: "Lugares que aprendiste",
    scoreLabel: (score: number): string => `Puntaje: ${score}`,
    saveQuestion: "¿Guardar tu puntaje? (opcional)",
    playerNamePlaceholder: "Tu nombre",
    save: "Guardar",
    saved: "¡Puntaje guardado!",
    nextLevel: "Siguiente nivel",
    backToMenu: "Volver al menú",
  },
  defeat: {
    title: "Sin vidas",
    subtitle: "Lugares que alcanzaste a emparejar",
    retry: "Reintentar",
    backToMenu: "Volver al menú",
  },
  scores: {
    title: "Puntajes",
    empty: "Aún no hay puntajes guardados para este nivel.",
    back: "Volver al menú",
  },
} as const;
