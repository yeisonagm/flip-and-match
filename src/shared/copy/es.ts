// All visible Spanish text lives here — nothing in a component. See SKILL.md silent
// failure #5.
export const copy = {
  menu: {
    title: "Flip & Match",
    subtitle: "Memoria de lugares turísticos del Perú",
    play: (levelLabel: string): string => `Jugar ${levelLabel}`,
    scores: "Ver puntajes",
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
    playerNamePlaceholder: "Tu nombre (opcional)",
    save: "Guardar puntaje",
    saved: "¡Puntaje guardado!",
    nextLevel: "Siguiente nivel",
    backToMenu: "Volver al menú",
  },
  defeat: {
    title: "Sin vidas",
    subtitle: "Lugares que alcanzaste a emparejar",
    scoreLabel: (score: number): string => `Puntaje: ${score}`,
    retry: "Reintentar",
    backToMenu: "Volver al menú",
  },
  scores: {
    title: "Puntajes",
    comingSoon: "Próximamente",
    back: "Volver al menú",
  },
} as const;
