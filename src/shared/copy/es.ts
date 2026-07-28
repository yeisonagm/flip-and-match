// All visible Spanish text lives here — nothing in a component. See SKILL.md silent
// failure #5.
export const copy = {
  menu: {
    title: "Descubre Perú",
    subtitle: "Memoria de lugares turísticos del Perú",
    play: (levelLabel: string): string => `Jugar ${levelLabel}`,
    pairsLabel: (pairs: number): string => `${pairs} pares`,
    scores: "Ver puntajes",
    fullscreen: "Pantalla completa",
  },
  game: {
    exit: "Salir",
    fullscreen: "Pantalla completa",
    brandSubtitle: "Encuentra los lugares",
    hiddenCard: "Carta oculta",
    time: "Tiempo",
    score: "Puntaje",
    attempts: "Intentos",
    matches: "Aciertos",
    misses: "Fallos",
    lives: "Vidas",
    unlimitedLives: "∞",
    levelProgress: "Dificultad",
    retry: "Reiniciar nivel",
    pairsProgress: (matched: number, total: number): string => `${matched} / ${total} pares`,
  },
  victory: {
    title: "¡Nivel completado!",
    subtitle: (levelLabel: string): string => `Dificultad ${levelLabel} superada`,
    gallerySubtitle: "Lugares que aprendiste",
    saveQuestion: "¿Guardar tu puntaje?",
    playerNamePlaceholder: "Tu nombre",
    save: "Guardar",
    saved: "¡Puntaje guardado!",
    nextLevel: "Siguiente nivel",
    backToMenu: "Volver al menú",
  },
  defeat: {
    title: "¡Se acabó la partida!",
    subtitle: (levelLabel: string, matched: number, total: number): string =>
      `Dificultad ${levelLabel} · ${matched} de ${total} parejas`,
    gallerySubtitle: "Lugares que alcanzaste a emparejar",
    encouragement: "¡No te rindas, tú puedes!",
    retry: "Reintentar nivel",
    backToMenu: "Volver al menú",
  },
  scores: {
    title: "Puntajes",
    empty: "Aún no hay puntajes guardados para este nivel.",
    back: "Volver al menú",
  },
  placeDetail: {
    close: "Cerrar",
    location: "Ubicación",
    viewDetails: (name: string): string => `Ver más sobre ${name}`,
  },
} as const;
