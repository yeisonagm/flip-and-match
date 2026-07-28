# Flip & Match — Plan de Implementación

> **Juego de memoria educativo sobre lugares turísticos del Perú.**
> Web SPA + ejecutable de escritorio (Tauri v2), pensado para pizarra digital / TV táctil.

Este documento es la **fuente de verdad** del proyecto: define alcance, restricciones,
arquitectura y convenciones. No es un README (ese va aparte, para quien solo quiere
clonar y correr). Aquí está el _cómo_ y el _por qué_.

---

## 1. Resumen

|                         |                                                                 |
| ----------------------- | --------------------------------------------------------------- |
| **Nombre**              | Flip & Match                                                    |
| **Qué es**              | Juego de memoria por parejas con 21 lugares turísticos del Perú |
| **Para quién**          | Estudiantes y público general, en contexto educativo            |
| **Dónde corre**         | Pizarra digital / TV táctil (principal), navegador (secundario) |
| **Distribución**        | `.exe` de Windows (Tauri) + build estático desplegable          |
| **Idioma del producto** | Español                                                         |
| **Idioma del código**   | Inglés (ver §14)                                                |

**Objetivo del MVP:** una persona que nunca vio la app se para frente a la pizarra,
elige un nivel y completa una partida sin que nadie tenga que explicarle nada.

---

## 2. Alcance

### Dentro del MVP (v1.0)

- Menú principal con tres niveles y acceso a puntajes.
- Fase de vista previa **configurable** (activable/desactivable, duración por defecto 2 s)
  con las cartas destapadas y la entrada bloqueada — ver §19.
- Mecánica de volteo y emparejamiento con detección de pares, garantizados en cantidades
  pares por construcción — ver §20.
- Cronómetro, contador de aciertos, contador de fallos, puntaje en vivo.
- **Vidas configurables** (por defecto 3, o ilimitadas), visibles durante toda la partida —
  ver §19.
- Nombre del lugar revelado **solo al emparejar** (recompensa educativa), nunca antes, ni en
  el placeholder de una imagen faltante.
- **Fallback visual** cuando falta la imagen de un lugar: placeholder generado, determinista,
  sin texto — el juego es jugable con cero imágenes agregadas — ver §19.
- Modal de fin de nivel: victoria con galería de lugares aprendidos y guardado opcional de
  puntaje con nombre; derrota con el resumen de la partida, **sin guardado de puntaje**.
- Tabla de posiciones Top 20 por nivel, solo con partidas ganadas.
- Pantalla completa desde botón en pantalla y desde F11.
- Layout sin scroll de 1024×600 a 4K.

### Fuera del MVP (v1.1+)

- Sonido y música.
- Animación de celebración con partículas.
- Modo dos jugadores por turnos.
- Pantalla de ajustes en la app para preview/vidas — hoy son constantes en
  `config/gameSettings.ts`, se editan y se recompila. Ver la nota de alcance en §19.
- Selección de categoría o región.
- Sincronización de puntajes entre dispositivos.
- Traducción a inglés o quechua.
- Instalador macOS / Linux.

**Regla de corte:** si una funcionalidad no está en la lista de arriba, no entra al MVP.
Las ideas nuevas van a un archivo `BACKLOG.md`, no al código.

---

## 3. Restricciones duras

Estas no son preferencias. Romper cualquiera de ellas rompe el producto.

| #   | Restricción                                                                                                                        | Por qué                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Cero red en tiempo de ejecución.** Ninguna fuente, imagen, script o telemetría se descarga.                                      | Las aulas no tienen internet confiable. La app debe funcionar desconectada.                                                                     |
| R2  | **Cero scroll.** Nunca puede aparecer una barra de desplazamiento en ninguna pantalla ni resolución.                               | En una pizarra táctil, un scroll accidental deja la interfaz inutilizable a media partida.                                                      |
| R3  | **`base: './'` en Vite.** Rutas relativas siempre.                                                                                 | Con rutas absolutas, el `.exe` empaquetado no encuentra los assets. Falla en silencio.                                                          |
| R4  | **Todo el estado del juego vive en un reducer puro.** Nada de lógica en componentes.                                               | Es la única defensa real contra los toques simultáneos (ver R5) y hace la lógica testeable sin renderizar.                                      |
| R5  | **Ningún gesto táctil del navegador queda activo.** Sin doble-tap zoom, sin selección de texto, sin menú contextual, sin `:hover`. | En pizarra, cualquiera de estos destruye el layout o deja estados fantasma.                                                                     |
| R6  | **Sin librería de estado global** (Redux, Zustand, Jotai).                                                                         | El estado de este juego cabe en un reducer y dos contextos. Agregar una librería es sobreingeniería.                                            |
| R7  | **Sin router.** La navegación es una máquina de pantallas en React.                                                                | Tres pantallas. Un `switch` basta y funciona igual en web que en `file://`.                                                                     |
| R8  | **El dominio no importa React.** `features/*/domain/` es TypeScript puro.                                                          | Permite testear todas las reglas en milisegundos y evita que la lógica se filtre a la UI.                                                       |
| R9  | **pnpm, no npm ni yarn.** Solo `pnpm-lock.yaml` se versiona; nunca `package-lock.json`.                                            | Instalación más rápida y liviana, y el aislamiento estricto de dependencias evita imports fantasma que `npm` permite por el hoisting a la raíz. |

---

## 4. Stack y versiones

Versiones realmente instaladas en el repo (`pnpm-lock.yaml`), no las genéricas del scaffold:

```
pnpm             11.17.0     gestor de paquetes — ver §4.1
Node             22.x
React            19.2.8
TypeScript       5.8.3       modo strict, sin excepciones — el rango ~5.8.3 no sube a 5.9
Vite             7.3.6
Tailwind CSS     4.3.3       plugin @tailwindcss/vite, config CSS-first, piso Chrome 111
Tauri            2.11.x
Vitest           4.1.10      solo para features/*/domain/, config separada de vite.config.ts
Biome            2.5.5       linter + formatter, reemplaza ESLint y Prettier
React Compiler   1.0.0
```

### 4.1 Gestor de paquetes: pnpm, no npm

**Restricción dura, agregada a la tabla de §3.** `npm` instala cada dependencia
duplicada en el `node_modules` de cada paquete que la usa, lo que en un proyecto con
Tauri (que además trae su propio árbol de crates de Rust) infla el disco y hace lento
cada `install`. `pnpm` mantiene un almacén global de contenido direccionado por hash y
usa hardlinks/symlinks hacia `node_modules`, así que cada versión de cada paquete vive
una sola vez en el disco sin importar cuántos proyectos la usen.

Hay una segunda razón, más importante que la velocidad: `npm` **hoiste**a todo a la raíz
de `node_modules`, lo que permite que el código importe paquetes que nunca declaró como
dependencia directa (porque otro paquete los arrastró). `pnpm` usa symlinks estrictos y
bloquea eso por diseño — si el código compila con `pnpm`, es porque el `package.json`
declara honestamente cada dependencia que usa. Para un proyecto que se va a mantener a
largo plazo, esa garantía vale más que el ahorro de espacio.

Instalación de pnpm (una sola vez por máquina):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Estado del proyecto

El scaffold ya existe (`pnpm create tauri-app` se ejecutó al iniciar el repo). Lo que sigue
describe cómo debe terminar configurado tras la Etapa 0 — no un paso de instalación nuevo.

```bash
pnpm install       # una sola vez, o tras clonar
pnpm dev           # servidor web, sin Tauri
pnpm tauri dev     # app de escritorio
```

**Siempre `pnpm`, nunca `npm run dev` ni `npx tauri dev` a secas.** Si aparece un
`package-lock.json`, es que algo corrió `npm install` por error: eso mezcla dos árboles de
`node_modules` y hay que borrar el archivo y reinstalar con `pnpm install`.

### `vite.config.ts`

El scaffold ya trae el bloque `server` que Tauri necesita (puerto 1420 fijo, `watch.ignored`
de `src-tauri/`). La Etapa 0 **fusiona** lo siguiente, no lo reemplaza:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  base: "./", // R3 — packaged .exe resolves assets relatively
  plugins: [
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
    tailwindcss(),
  ],
  build: { target: "chrome111" }, // Tailwind v4's floor (@property, color-mix()) — WebView2 clears it
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
}));
```

### `src-tauri/capabilities/default.json`

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-set-fullscreen",
    "core:window:allow-is-fullscreen"
  ]
}
```

Sin `opener:default`: el plugin `tauri-plugin-opener` se retira en la Etapa 0 (no se usa en
ningún requisito del MVP) junto con su entrada en `Cargo.toml`, `lib.rs` y `package.json`.

### `src-tauri/tauri.conf.json` (fragmento)

```json
{
  "productName": "Flip & Match",
  "mainBinaryName": "flip-and-match",
  "app": {
    "windows": [
      {
        "title": "Flip & Match",
        "width": 1280,
        "height": 800,
        "minWidth": 1024,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": true,
        "zoomHotkeysEnabled": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: http://asset.localhost; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src ipc: http://ipc.localhost"
    }
  },
  "bundle": {
    "targets": ["nsis"],
    "windows": {
      "webviewInstallMode": { "type": "offlineInstaller" }
    }
  }
}
```

`fullscreen: true` al arranque porque el destino es un kiosco, no una app de escritorio
convencional. El botón de salir en pantalla es entonces obligatorio. En Etapa 0 este valor
queda temporalmente en `false` — con `true` puesto desde el principio, `pnpm tauri dev` se
vuelve incómodo de usar durante el resto del desarrollo — y se reactiva recién en la Etapa 5
de pulido (§16).

`csp` deja de ser `null`: es defensa en profundidad, no la garantía de R1 en sí misma — la
garantía real es que ninguna URL remota aparezca en el bundle, verificada en modo avión — pero
convierte "cero red" de una convención en algo que el motor del WebView puede bloquear. Los
tokens de `connect-src` son los que exige el IPC de Tauri v2; conviene reverificarlos contra
la consola del WebView la primera vez que se activa, por si difieren entre versiones de
Tauri.

`targets: ["nsis"]` en vez de `"all"`: el instalador MSI (WiX) descarga un toolchain en el
primer build que suele fallar tras un proxy escolar, y no soporta `offlineInstaller` como
NSIS. `webviewInstallMode: offlineInstaller` reemplaza el valor por defecto
(`downloadBootstrapper`), que necesita internet **al instalar** — exactamente lo que este
proyecto no puede asumir en un aula. Cuesta ~130 MB más de instalador; es el precio correcto
para "cero red en tiempo de ejecución" extendido a "cero red también al instalar".

---

## 5. Arquitectura

**Screaming Architecture:** la estructura de carpetas debe gritar "esto es un juego de
memoria educativo", no "esto es una app de React". Nadie aprende nada de una carpeta
llamada `components/` en la raíz.

### Regla de dependencias (unidireccional)

```
app/  ──►  features/  ──►  shared/
                │
                └────────►  platform/
```

- `domain/` no importa **nada** del proyecto excepto sus propios tipos.
- `features/` no se importan entre sí. Si dos features necesitan lo mismo, sube a `shared/`.
- Cada feature expone su API pública por `index.ts`. Importar rutas internas de otra
  feature es un error de revisión.

### Capas dentro de una feature

| Capa          | Contiene                        | Puede importar                                |
| ------------- | ------------------------------- | --------------------------------------------- |
| `domain/`     | tipos, reducer, cálculos puros  | nada                                          |
| `ports/`      | interfaces (contratos)          | `domain/`                                     |
| `infra/`      | implementaciones de los puertos | `domain/`, `ports/`                           |
| `hooks/`      | orquestación React del dominio  | `domain/`, `ports/`                           |
| `components/` | render puro                     | `hooks/`, `domain/` (solo tipos), `shared/ui` |

---

## 6. Estructura de carpetas

```
flip-and-match/
├── public/
│   └── images/
│       ├── card-back.svg
│       └── places/                  # 21 fotos .jpg/.webp — ver §20 (un test valida que existan)
├── src/
│   ├── app/
│   │   ├── App.tsx                  # máquina de pantallas
│   │   ├── screens/
│   │   │   ├── MenuScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   └── ScoresScreen.tsx
│   │   └── types.ts                 # Screen = { kind: 'MENU' } | { kind: 'GAME'; levelId } | { kind: 'SCORES' }
│   ├── features/
│   │   ├── catalog/
│   │   │   ├── places.data.ts       # las 20 fichas
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── memory-game/
│   │   │   ├── domain/
│   │   │   │   ├── types.ts
│   │   │   │   ├── gameReducer.ts
│   │   │   │   ├── buildDeck.ts
│   │   │   │   ├── scoring.ts
│   │   │   │   ├── lives.ts         # livesRemaining(state) — dato derivado, ver §19
│   │   │   │   └── __tests__/
│   │   │   ├── config/
│   │   │   │   ├── levels.ts
│   │   │   │   └── gameSettings.ts  # DEFAULT_GAME_SETTINGS, ver §19
│   │   │   ├── hooks/
│   │   │   │   ├── useMemoryGame.ts
│   │   │   │   └── useGameClock.ts
│   │   │   ├── components/
│   │   │   │   ├── Board.tsx         # calcula cols/rows para ambas orientaciones, ver §10
│   │   │   │   ├── CardItem.tsx
│   │   │   │   ├── GameHeader.tsx    # marca + estadísticas + dificultad — ver §10
│   │   │   │   ├── GameFooter.tsx    # reintentar + progreso de pares — ver §10
│   │   │   │   ├── LevelSteps.tsx    # indicador de dificultad (posición, no bloqueo)
│   │   │   │   ├── StatPill.tsx      # pastilla icono + valor de la fila superior
│   │   │   │   ├── LivesIndicator.tsx
│   │   │   │   ├── StatTile.tsx      # tile de estadística, reusado por ambos modales
│   │   │   │   ├── PlaceGallery.tsx  # shared by both modals below
│   │   │   │   ├── VictoryModal.tsx
│   │   │   │   └── DefeatModal.tsx   # shares Modal shell with VictoryModal via shared/ui
│   │   │   └── index.ts
│   │   └── leaderboard/
│   │       ├── domain/
│   │       │   ├── types.ts
│   │       │   └── ranking.ts       # rankWith() — Top 20 y desempate, puro y testeado
│   │       ├── scoreRepository.ts   # contrato + única implementación (localStorage), ver §13
│   │       ├── components/LeaderboardTable.tsx
│   │       └── index.ts
│   ├── platform/
│   │   ├── fullscreen/
│   │   │   ├── FullscreenPort.ts
│   │   │   ├── webFullscreen.ts
│   │   │   ├── tauriFullscreen.ts
│   │   │   └── index.ts             # detecta entorno y exporta el adaptador
│   │   └── pwa/                     # instalable + sin conexión en el build web, ver §22
│   │       ├── registerPwa.ts
│   │       ├── useInstallPrompt.ts
│   │       └── index.ts
│   ├── shared/
│   │   ├── ui/                      # Button, Modal, Tabs, PlaceImage, PlacePlaceholder,
│   │   │                            # PlaceDetailModal (ver §19, §21)
│   │   ├── lib/
│   │   │   ├── shuffle.ts
│   │   │   ├── createId.ts
│   │   │   ├── formatTime.ts
│   │   │   └── computeGridDimensions.ts  # cols/rows por orientación, ver §10
│   │   └── copy/es.ts               # TODOS los textos visibles, en un solo lugar
│   ├── styles/index.css
│   └── main.tsx
├── src-tauri/
├── biome.json
├── vite.config.ts
└── IMPLEMENTATION_PLAN.md
```

---

## 7. Modelo de dominio

```ts
// features/catalog/types.ts
// location y description sí tienen un lector real: el PlaceDetailModal que se abre al
// tocar una foto en la galería de "lugares aprendidos" del modal de victoria/derrota
// (ver §21). description es una tupla fija de dos elementos, no `readonly string[]`: el
// modal siempre pinta exactamente dos párrafos, así que el tipo mismo hace irrepresentable
// un lugar con cero, uno o cinco.
export interface TouristPlace {
  readonly id: string; // 'machu-picchu'
  readonly name: string; // 'Machu Picchu'
  readonly imageUrl: string; // './images/places/machu-picchu.webp'
  readonly location: string; // 'Cusco, Perú'
  readonly description: readonly [string, string];
}
```

```ts
// app/types.ts
// Con datos adjuntos, no un enum de strings: MENU + levelId sería un estado
// representable e imposible con un useState paralelo.
export type Screen =
  | { readonly kind: "MENU" }
  | { readonly kind: "GAME"; readonly levelId: LevelId }
  | { readonly kind: "SCORES" };
```

```ts
// features/memory-game/domain/types.ts
export type LevelId = "easy" | "medium" | "hard";

// EVALUATING_MATCH / EVALUATING_MISS, no un único EVALUATING + booleano: ver §19
// para GameSettings y la nota "Por qué el bloqueo se parte en dos estados" más abajo.
export type GameStatus =
  | "PREVIEW"
  | "PLAYING"
  | "EVALUATING_MATCH"
  | "EVALUATING_MISS"
  | "VICTORY"
  | "DEFEAT";

export const isEvaluating = (s: GameStatus): boolean =>
  s === "EVALUATING_MATCH" || s === "EVALUATING_MISS";
export const isFinished = (s: GameStatus): boolean =>
  s === "VICTORY" || s === "DEFEAT";

export interface Card {
  readonly instanceId: string; // unique per board slot; the pair shares place.id
  readonly place: TouristPlace;
  readonly isFlipped: boolean;
  readonly isMatched: boolean;
}

export interface GameState {
  readonly levelId: LevelId;
  readonly settings: GameSettings; // see §19 — injected via START, never imported by the reducer
  readonly status: GameStatus;
  readonly cards: readonly Card[];
  readonly flipped: readonly string[]; // instanceIds, max 2
  readonly matches: number;
  readonly misses: number; // livesRemaining is derived from this + settings.maxLives, see §19
  readonly startedAt: number | null; // performance.now()
  readonly elapsedMs: number;
}

export type GameAction =
  | {
      type: "START";
      cards: readonly Card[];
      levelId: LevelId;
      settings: GameSettings;
      now: number;
    }
  | { type: "END_PREVIEW"; now: number }
  | { type: "SELECT_CARD"; instanceId: string } // decides MATCH vs MISS immediately
  | { type: "RESOLVE_PAIR"; now: number } // only commits the outcome SELECT_CARD already decided
  | { type: "TICK"; now: number };
```

`status: 'VICTORY' | 'DEFEAT'` como dos valores separados (en vez de un booleano
`didWin` colgado del estado `FINISHED`) es la aplicación directa de R4 y de la regla de
uniones discriminadas en §14: cada pantalla de cierre necesita contenido y acciones
distintas (§ RF-12 vs RF-13), y con estados separados el componente que las renderiza no
puede recibir una combinación imposible como "terminado sin saber si ganó o perdió".

### Por qué el bloqueo se parte en `EVALUATING_MATCH` / `EVALUATING_MISS`

Acierto bloquea 600 ms, fallo bloquea 900 ms (§8), pero el hook tiene que programar el
`setTimeout` **antes** de saber cuál de los dos es — y ese resultado se conoce en el instante
en que se voltea la segunda carta, no después. Que una acción `RESOLVE_PAIR` separada
"decidiera" el resultado era artificial: no hay nada que cambie entre `SELECT_CARD` y que el
timeout dispare.

La solución es que **`SELECT_CARD` resuelva el resultado** y lo codifique en el propio
`status` — nunca en un campo nulable tipo `pendingOutcome`, que reintroduce exactamente el
problema que las uniones discriminadas evitan (`{ status: 'PLAYING', pendingOutcome: 'MISS' }`
sería representable y no tendría sentido). `RESOLVE_PAIR` pasa a ser una simple confirmación:
la duración del bloqueo es entonces una función total de `status`, sin campos nuevos.

```ts
case "SELECT_CARD": {
  if (state.status !== "PLAYING") return state;
  if (state.flipped.length >= 2) return state;

  const picked = state.cards.find((c) => c.instanceId === action.instanceId);
  if (picked === undefined || picked.isFlipped || picked.isMatched) return state;

  const flipped = [...state.flipped, picked.instanceId];
  const faceUp = state.cards.map((c) =>
    c.instanceId === picked.instanceId ? { ...c, isFlipped: true } : c,
  );

  const [firstId] = state.flipped; // string | undefined bajo noUncheckedIndexedAccess
  if (firstId === undefined) return { ...state, cards: faceUp, flipped };

  const first = state.cards.find((c) => c.instanceId === firstId);
  if (first === undefined) return state;

  if (first.place.id !== picked.place.id) {
    return { ...state, cards: faceUp, flipped, misses: state.misses + 1, status: "EVALUATING_MISS" };
  }
  return {
    ...state,
    cards: faceUp.map((c) => (flipped.includes(c.instanceId) ? { ...c, isMatched: true } : c)),
    flipped,
    matches: state.matches + 1,
    status: "EVALUATING_MATCH", // las cartas ya quedan marcadas; el caption entra de inmediato
  };
}

case "RESOLVE_PAIR": {
  if (state.status === "EVALUATING_MATCH") {
    const won = state.cards.every((c) => c.isMatched);
    return { ...state, flipped: [], elapsedMs: action.now - (state.startedAt ?? action.now), status: won ? "VICTORY" : "PLAYING" };
  }
  if (state.status === "EVALUATING_MISS") {
    const cards = state.cards.map((c) => (state.flipped.includes(c.instanceId) ? { ...c, isFlipped: false } : c));
    // DEFEAT se comprueba antes que cualquier otra cosa: un fallo que agota la última
    // vida nunca resuelve a VICTORY, aunque coincida con el último par (RF-09).
    const dead = livesRemaining({ ...state, misses: state.misses }) === 0;
    return { ...state, cards, flipped: [], elapsedMs: action.now - (state.startedAt ?? action.now), status: dead ? "DEFEAT" : "PLAYING" };
  }
  return state;
}
```

El hook mapea `status` a duración sin ramas adicionales:

```ts
useEffect(() => {
  if (!isEvaluating(state.status)) return;
  const ms =
    state.status === "EVALUATING_MATCH"
      ? state.settings.matchLockoutMs
      : state.settings.missLockoutMs;
  const id = window.setTimeout(
    () => dispatch({ type: "RESOLVE_PAIR", now: performance.now() }),
    ms,
  );
  return () => window.clearTimeout(id);
}, [state.status, state.settings]);
```

```ts
// features/leaderboard/domain/types.ts
export interface ScoreEntry {
  readonly id: string;
  readonly playerName: string;
  readonly score: number;
  readonly timeSeconds: number;
  readonly misses: number;
  readonly date: string; // ISO yyyy-mm-dd
}
```

### Configuración de niveles

```ts
// features/memory-game/config/levels.ts
export interface LevelConfig {
  readonly label: string;
  readonly pairs: number;
  readonly maxLives: number;
}

export const LEVELS = {
  easy: { label: "Fácil", pairs: 6, maxLives: 3 },
  medium: { label: "Medio", pairs: 9, maxLives: 4 },
  hard: { label: "Difícil", pairs: 12, maxLives: 5 },
} as const satisfies Record<LevelId, LevelConfig>;
```

`maxLives` vive aquí, no como una sola constante: sube con el nivel (3/4/5) porque un
tablero más grande da más ocasiones de fallar por pura carga de memoria — ver la nota junto
a RF-08.

**Sin `cols`/`rows` fijos por nivel.** Una versión anterior de este documento los fijaba
por nivel asumiendo que el destino siempre iba a ser una pantalla 16:9 apaisada — pero la
app también corre en tablet/teléfono en vertical, donde esa suposición desperdicia la
mitad del ancho y encoge las cartas. La cantidad de pares sigue siendo del nivel (la
dificultad); la disposición cols×rows se **calcula en cada render** a partir de esa
cantidad y de la orientación real de la pantalla, en `shared/lib/computeGridDimensions.ts`
(§10) — probada con tests de dominio (§20), no solo por convención. De hecho, fue
precisamente un test de esta clase el que atrapó el primer incumplimiento real de la regla
anterior: una versión de este documento tenía el nivel medio en `4×4`, una grilla cuadrada
que violaba "más columnas que filas" por definición.

`as const satisfies` da autocompletado literal _y_ validación de forma. Es el patrón
correcto de TypeScript para configuración estática.

---

## 8. Reglas de juego

| ID    | Regla                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-01 | La app abre en el Menú. Tres niveles + botón "Ver puntajes" + botón "Pantalla completa".                                                                                                                                                                                                                                                                                                                                                                 |
| RF-02 | Si `settings.preview.enabled`, estado `PREVIEW` durante `settings.preview.durationMs` (por defecto 2000 ms — 1500 ms resultó insuficiente para registrar más de una o dos cartas): todas las cartas visibles, entrada bloqueada, cronómetro en `00:00`. Si está desactivado, la partida arranca directo en `PLAYING`, ver §19.                                                                                                                           |
| RF-03 | El mazo se arma tomando un **subconjunto aleatorio** de las fichas del catálogo y mezclando (§8, "Barajado"). Se evita repetir el mazo de la partida anterior. Cada lugar aporta **siempre exactamente dos cartas**, por construcción — ver §20.                                                                                                                                                                                                         |
| RF-04 | Al terminar `PREVIEW` (o de inmediato si está desactivado), las cartas se ocultan con un volteo escalonado y arranca el cronómetro.                                                                                                                                                                                                                                                                                                                      |
| RF-05 | Un toque voltea una carta. Al voltear la segunda, el resultado se resuelve de inmediato y el estado pasa a `EVALUATING_MATCH` o `EVALUATING_MISS` (§7); la entrada queda bloqueada en ambos.                                                                                                                                                                                                                                                             |
| RF-06 | **Acierto:** las cartas ya quedan marcadas como emparejadas al entrar a `EVALUATING_MATCH`, y **aparece el nombre del lugar**. Bloqueo de `settings.matchLockoutMs` (600 ms).                                                                                                                                                                                                                                                                            |
| RF-07 | **Fallo:** en `EVALUATING_MISS` se incrementa el contador de fallos de inmediato; las cartas vuelven a taparse **al resolver el bloqueo**, no antes. Bloqueo de `settings.missLockoutMs` (900 ms).                                                                                                                                                                                                                                                       |
| RF-08 | **Vidas: `LEVELS[levelId].maxLives`, por nivel — Fácil 3, Medio 4, Difícil 5.** `settings.maxLives` sigue existiendo como el campo que el reducer consulta (y admite `null` para desactivar la derrota, modo práctica), pero su valor real lo decide el nivel, no una constante única (ver nota abajo). Se muestran en el header como corazones **durante toda la partida**; cada fallo apaga uno. Con `maxLives: null` no se dibuja el bloque de vidas. |
| RF-09 | Al fallar con **cero vidas restantes** (`maxLives` no nulo): estado `DEFEAT`, se detiene el cronómetro y se abre el modal de derrota. La resolución del par (volver a tapar, bloqueo de fallo) ocurre igual antes de mostrar el modal, para que el jugador vea el error que lo eliminó. `DEFEAT` se comprueba antes que `VICTORY`: nunca se declara victoria por el último par si ese mismo fallo agotó la última vida.                                  |
| RF-10 | Puntaje: `max(0, 10000 - segundos * 10 - fallos * 100)`. Se muestra **en vivo, solo mientras se juega y en el modal de victoria**. **No se calcula ni se muestra en la derrota** — un game over no terminó la partida, así que no hay un puntaje válido que mostrar (decisión de producto).                                                                                                                                                              |
| RF-11 | Al emparejar el último par **con al menos una vida restante (o `maxLives: null`)**: se detiene el cronómetro, estado `VICTORY`, se abre el modal de victoria.                                                                                                                                                                                                                                                                                            |
| RF-12 | El modal de victoria muestra primero las acciones principales — **siguiente nivel, volver al menú** — y la galería de lugares aprendidos con el puntaje. Guardar el puntaje con nombre es una fila secundaria y visualmente discreta debajo de las acciones, claramente opcional: no bloquea continuar ni se confunde con la acción principal de la pantalla.                                                                                            |
| RF-13 | El modal de derrota muestra los lugares que sí se llegaron a emparejar (parcial, no la galería completa) y ofrece: **reintentar el mismo nivel**, volver al menú. **Sin puntaje, sin opción de guardar, sin siguiente nivel** — solo se guardan las victorias (decisión de producto, ver nota abajo).                                                                                                                                                    |
| RF-14 | Los puntajes se guardan por nivel, ordenados de mayor puntaje y luego menor tiempo (desempate), **máximo 20 entradas** por nivel. **Solo entran partidas ganadas** — una derrota nunca aparece en la tabla, aunque su puntaje calculado fuera alto.                                                                                                                                                                                                      |

### Por qué las vidas suben con el nivel

`maxLives: number | null` vive en `GameSettings` (§19), no como constante de dominio — el
reducer solo sabe leer `settings.maxLives`, nunca de dónde salió. El **valor** por nivel vive
en `LEVELS[levelId].maxLives` (§7): Fácil 3, Medio 4, Difícil 5. Sube en vez de bajar porque
un tablero más difícil tiene más pares que sostener en memoria y por tanto más ocasiones de
fallar — dejar las vidas fijas (o reducirlas) apilaría dos perillas de dificultad una sobre
otra: más cartas que recordar **y** menos margen de error. `useMemoryGame` arma el
`GameSettings` real por partida mezclando el nivel encima de `DEFAULT_GAME_SETTINGS` justo
antes de repartir el mazo — `DEFAULT_GAME_SETTINGS.maxLives` queda como relleno de tipo, sin
efecto en una partida real. Que siga siendo `number | null` en el reducer —incluida la opción
`null`, sin derrota, para modo exhibición o práctica— es lo que permite tocar estos valores
sin tocar el reducer.

### Por qué la derrota no interrumpe la animación del fallo

RF-09 es deliberado: si el estado saltara a `DEFEAT` apenas se detecta que la vida llegó a
cero, las dos últimas cartas quedarían congeladas boca arriba sin que el jugador entienda
qué pasó. Dejar correr el bloqueo de `EVALUATING_MISS` normal — mismo tiempo, misma
animación — y **después** transicionar a `DEFEAT` hace que la derrota se sienta como
consecuencia de ese error específico, no como una interrupción abrupta.

### Por qué solo se guarda el puntaje de una victoria

Se evaluó guardar también las derrotas (el puntaje ya reflejaría los fallos y competiría en
igualdad de condiciones), pero se descartó: la tabla de posiciones debe leerse como "quién
completó el nivel mejor", no mezclar completado con abandono. Guardar solo victorias también
simplifica el modal de derrota — sin input de nombre, sin botón de guardar, una decisión
menos que tomar en el peor momento de la partida.

### Por qué 900 ms en el fallo y 600 ms en el acierto

No son números arbitrarios. En una pizarra de pared, con varias personas mirando desde
lejos, 600 ms no alcanza para registrar la posición de dos cartas que no coinciden.
En el acierto, en cambio, 600 ms es justo lo que tarda la animación del nombre en entrar;
alargarlo se siente lento.

### Barajado: decorar–ordenar–desdecorar

El Fisher-Yates clásico (`[result[i], result[j]] = [result[j], result[i]]`) **no compila**
bajo `noUncheckedIndexedAccess` (§14): el lado derecho es `T | undefined`, el izquierdo es
`T`, y las dos salidas obvias (`!`, `as`) están prohibidas por las convenciones del proyecto.
Se usa en su lugar el patrón decorar–ordenar–desdecorar, con el generador aleatorio inyectado
para que los tests sean deterministas:

```ts
// shared/lib/shuffle.ts
export type Rng = () => number;

// Not the banned sort(() => Math.random() - 0.5): the key is drawn once per item, so the
// comparator is a consistent total order and the resulting permutation is uniform.
export function shuffle<T>(
  items: readonly T[],
  rng: Rng = Math.random,
): readonly T[] {
  return items
    .map((item) => ({ item, key: rng() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}
```

**Nunca** usar `array.sort(() => Math.random() - 0.5)` directamente sin la decoración: ese
patrón está sesgado y en algunos motores tiene comportamiento indefinido. Aquí la clave
aleatoria se calcula una sola vez por elemento, así que el comparador es un orden total
consistente y la permutación resultante es uniforme.

---

## 9. Dirección visual

**Segunda dirección visual (post-Etapa 5), reemplaza la anterior.** La primera versión de
este documento proponía un concepto oscuro y sobrio ("Textil andino sobre cielo de
altura": fondo azul-noche, tintes andinos apagados). El usuario pidió explícitamente un
giro hacia un estilo claro, colorido y lúdico tipo app móvil moderna — a partir de
referencias visuales concretas que compartió — y ese es el que queda vigente. El sujeto
(Perú, lugares turísticos, público joven) no cambia; sí cambia el tono: de "sobrio y
nocturno" a "brillante y de juego".

### Concepto: **Fondo teal sólido de marca, tarjetas blancas**

**Tercera dirección visual, reemplaza la anterior.** El fondo pasó de un degradado pastel
con manchas de color a un **teal sólido de marca** (`--color-app-bg: #009d9e`) detrás de
toda la app — pantalla de menú, juego, puntajes — a partir de una referencia visual
concreta (tarjetas blancas con el logo sobre fondo teal). Cada dificultad conserva su
propia familia de color en degradado (verde/ámbar/magenta para fácil/medio/difícil),
reutilizada en botones de nivel, CTAs y acentos. Tarjetas y modales siguen siendo
superficies blancas con esquinas muy redondeadas y sombra suave — eso no cambió.

**Contraste de texto sobre el fondo teal.** Un fondo tan saturado no admite cualquier color
de texto: `--color-ink` (pensado para texto sobre blanco) solo llega a 3.85:1 contra
`#009d9e` — no alcanza el 4.5:1 que exige WCAG AA para texto normal, y `--color-muted` cae
a un 1.44:1 inutilizable. Por eso existe `--color-ink-on-brand: #04202b`, que sí llega a
~5.5:1, reservado para los pocos textos que quedan **directamente** sobre el fondo (no
dentro de una tarjeta blanca): título y subtítulo del menú, título de la pantalla de
puntajes y su mensaje vacío, y las etiquetas del indicador de dificultad del header —
`text-on-brand.opacity: 0.72` sustituye a `--color-muted` para la variante "secundaria" de
ese mismo texto, en vez de un segundo color con su propio contraste por verificar.

### Tokens

```css
/* styles/index.css */
@import "tailwindcss";

@theme {
  /* Palette — bright, playful, modern: flat brand teal behind everything, one gradient
     family per level for buttons and accents */
  --color-app-bg: #009d9e;
  --color-page-start: #eaf7fb; /* pale tint reused for pill/chip backgrounds */
  --color-surface: #ffffff;
  --color-ink: #0b3550; /* headings, primary text on white surfaces */
  --color-ink-on-brand: #04202b; /* text directly on --color-app-bg — ~5.5:1, see above */
  --color-muted: #5b7688; /* secondary text on white surfaces */
  --color-border: #e3edf2;

  --color-brand: #0e8a9c; /* teal — primary CTAs, links, progress */
  --color-brand-dark: #0b6b7a;
  --color-easy: #63c24a;
  --color-easy-dark: #499a35;
  --color-medium: #f6a71f;
  --color-medium-dark: #d98a06;
  --color-hard: #e0417a;
  --color-hard-dark: #b8215a;
  --color-gold: #f6b93b; /* stars, score */
  --color-danger: #e0417a; /* lost life, defeat accents */

  /* Type */
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-body: "Inter Tight", system-ui, sans-serif;

  /* Motion */
  --flip-duration: 420ms;
  --flip-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

### Tipografía

- **Bricolage Grotesque** (variable) para títulos, nombres de lugar y cronómetro. Tiene
  ejes de ancho y tamaño óptico que le dan carácter sin caer en la fuente redondeada
  genérica de juego infantil.
- **Inter Tight** para UI, botones y tabla de puntajes.
- El cronómetro y los puntajes usan `font-variant-numeric: tabular-nums`. Sin esto, los
  dígitos cambian de ancho y el reloj tiembla en pantalla grande — se nota muchísimo a
  distancia.

Ambas se **auto-hospedan** vía `@fontsource-variable/*`, importadas desde `src/`, no
copiadas a mano a `public/fonts/`. Nada de `fonts.googleapis.com`.

**Trampa evitada:** un `.woff2` en `public/fonts/` referenciado desde una hoja de estilos que
Vite hashea a `dist/assets/` resuelve la URL contra `/assets/`, no contra la raíz del sitio —
funciona en `pnpm dev` y da 404 **solo dentro del `.exe` empaquetado**, exactamente el modo de
fallo que R3 (`base: './'`) existe para prevenir. Al importar la fuente desde `src/`, Vite la
procesa como cualquier otro asset y reescribe la URL correctamente en ambos entornos.

### Elemento firma: cartas boca abajo con el logo

El reverso de la carta es una tarjeta blanca lisa con el logo de la app centrado —
reemplaza tanto la versión con "?" como la anterior con patrón tejido. Todas las cartas
boca abajo son **idénticas**, sin variación de tono por posición: la referencia visual que
define este diseño (mockup de tarjetas blancas sobre fondo teal) las muestra así, y el
logo ya aporta identidad de marca suficiente sin necesitar un truco de `hue-rotate` por
carta. Esto simplificó `CardItem.tsx`: la custom property `--card-index` que solo existía
para ese filtro se retiró, junto con el prop `index` que la alimentaba.

```css
.card-face--back {
  display: grid;
  place-items: center;
  padding: 10%;
  background: var(--color-surface);
  box-shadow: inset 0 0 0 1px var(--color-border);
}
.card-back-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

El `padding: 10%` dimensiona el logo de forma proporcional a la carta —grande, casi al
borde, como en la referencia— sin fijar un tamaño en píxeles que se vería mal en un nivel
con celdas más grandes o más chicas.

### Motion

Un solo momento orquestado: la transición `PREVIEW → PLAYING` voltea las cartas en
cascada con **25 ms de retardo por carta**, en orden de lectura. Todo lo demás es
funcional: el volteo individual y la entrada del nombre al emparejar. Nada más.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Layout sin scroll — el contrato CSS

Esta es la parte que más se rompe. El patrón es **CSS puro, sin JavaScript, sin
ResizeObserver**.

```
┌───────────────────────────────────────────────────────────────┐
│  GAME HEADER  (flex: 0 0 auto — tres bandas, ver nota)         │
│  [ ✕ ]        (logo) Flip & Match / Encuentra los lugares [⛶] │
│  ⭐ 8 760   👆 12   ⏱ 01:24   ♥ ♥ ♡                            │
│   ✓─────────── ② ─ ─ ─ ─ ─ ─ ③                                │
│  Fácil        Medio          Difícil                           │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│                  BOARD AREA (flex: 1, min-height: 0)           │
│                                                                 │
│              ┌───┬───┬───┬───┬───┐                             │
│              ├───┼───┼───┼───┼───┤                             │
│              ├───┼───┼───┼───┼───┤                             │
│              └───┴───┴───┴───┴───┘                             │
│                                                                 │
├───────────────────────────────────────────────────────────────┤
│  GAME FOOTER  (flex: 0 0 auto)                                 │
│  [ ↻ ]           4 / 12 pares                                  │
│         ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░                  │
└───────────────────────────────────────────────────────────────┘
```

**El header son tres bandas apiladas, no una fila.** El `<header>` en sí es transparente:
la barra de marca y cada pastilla de estadística llevan su propia superficie blanca, y el
indicador de dificultad se apoya directo sobre el fondo de la página. Los botones de salir
(✕) y pantalla completa (⛶) son objetivos táctiles fijos de 64×64 (§11 regla 4) que nunca
se encogen; cuando compartían fila con las estadísticas, en un viewport angosto vertical el
botón de salir terminaba envuelto (`flex-wrap`) a una segunda línea **por sí solo** — el
header saltaba de ~48 px a ~116 px de alto y le robaba esa diferencia al tablero. Con una
banda propia por función, ningún control compite por espacio con nada que pueda empujarlo.

La fila de estadísticas es un **grid de columnas fijas** (`repeat(4, minmax(0, 1fr))`), no
un flex que envuelve: una cuarta pastilla envuelta duplicaría la altura de la banda en
silencio y esa altura sale del tablero. Las pastillas se encogen; la fila nunca crece.
Cada pastilla muestra solo un icono y su valor —el rótulo viaja como texto
`.visually-hidden`, no como `aria-label`, porque un reloj dentro de un `aria-label` se
re-anuncia en cada tick—. Las cuatro son datos reales del dominio: puntaje, intentos
(`matches + misses`), tiempo y vidas. No hay estadísticas inventadas.

El **indicador de dificultad** (`LevelSteps.tsx`) recorre los tres niveles: los que quedan
atrás llevan un check, el actual su número, y los que faltan un candado. El candado es un
SVG delineado y no el emoji 🔒, porque el emoji se pinta con la fuente de color del sistema
y no puede tomar el gris apagado del resto del paso. Las líneas conectoras van a `z-index: 0`
contra el `z-index: 1` del círculo: la línea pertenece al paso de su derecha, que se pinta
después de su vecino de la izquierda, así que sin eso pasaría **por encima** de ese círculo.
Ese mismo `z-index: 1` obligó a declarar `z-index: 100` en `.modal-overlay` — el overlay va
último en el marcado, pero eso solo le gana a hermanos con `z-index: auto`, y los tres
círculos atravesaban el modal de victoria.

**El footer** (`GameFooter.tsx`) muestra el progreso de la partida — "N / pairs pares",
con una barra de relleno — y un botón para reiniciar el nivel actual sin pasar por el
menú. Mismo componente `.btn-icon` de 64×64 que el botón de salir, mismo motivo: es un
control táctil, no decoración.

**Una pantalla ancha y baja no puede pagar tres bandas.** En 1024×600, apiladas dejarían la
celda por debajo del mínimo táctil de 64 px. Por eso `@media (min-width: 820px) and
(max-height: 820px)` pone las tres bandas **una al lado de otra** — que es justamente para
lo que sirve el espacio horizontal sobrante ahí — y ahí las pastillas pasan a columnas
dimensionadas por contenido, porque compartiendo fila con la barra de marca cuatro columnas
iguales no alcanzan para "10 000" sin cortarlo. Medido: header 76 px y celda de 96 px.
En el otro extremo, header y footer se limitan a `min(100%, 1180px)` centrados, para que una
pizarra de 1920 px no estire cuatro pastillas a lo largo de dos metros de vidrio.

**Por qué el criterio de aceptación no es "no aparece scroll".** Con `overflow: hidden` en
`.app-shell`, una barra de scroll es **imposible por definición** — no es una salvaguarda,
es lo que hace que los errores de este contrato sean invisibles: en vez de una barra, lo que
pasa es **recorte silencioso**. Una última fila de cartas cortada se ve como una decisión de
diseño hasta que alguien la nota en la pizarra real. El criterio real es _"la fila inferior de
cartas se ve completa"_, y el ajuste está garantizado por construcción — el `overflow: clip`
de abajo es un respaldo, no la garantía.

El tamaño de celda se calcula **directamente, restando los gaps**, en vez de derivarlo de un
`aspect-ratio` en el tablero — un `aspect-ratio` ignora los `gap`, así que la caja siempre
queda un poco más alta que su contenido cuadrado, y además nunca se declaraban
`grid-template-rows`, con lo que las filas quedaban implícitas y dimensionadas por el
contenido en vez de por el propio contrato:

```css
html,
body,
#root {
  height: 100%;
  overflow: clip;
  overscroll-behavior: none;
}

.app-shell {
  --shell-pad: clamp(0.5rem, 2vmin, 2rem);
  height: 100dvh;
  display: flex;
  flex-direction: column; /* header arriba, tablero abajo — no sidebar lateral, ver nota */
  gap: var(--shell-pad);
  overflow: clip; /* respaldo — la garantía es aritmética, no este recorte */
  padding: var(
    --shell-pad
  ); /* el padding vive aquí, no en el contenedor de tamaño */
  box-sizing: border-box;
}

.game-header {
  flex: 0 0 auto; /* alto por contenido — el resto del alto es todo para el tablero */
  min-width: 0;
  overflow: clip;
  overflow-wrap: anywhere;
}

.board-area {
  flex: 1;
  min-width: 0; /* required: flex children default to min-width:auto */
  min-height: 0; /* same for the cross axis — this is the #1 scroll bug */
  container-type: size; /* size containment: el contenido nunca puede agrandar esta caja */
  display: grid;
  place-items: center;
}

.board {
  --gap: clamp(0.25rem, 1vmin, 1.25rem);
  /* Landscape por defecto; una query de contenedor la cambia a portrait — ver
     "Orientación dinámica" abajo. */
  --cols: var(--cols-landscape);
  --rows: var(--rows-landscape);
  /* Ambos candidatos restan los gaps, así que la celda es exactamente cuadrada y
     cols*cell + (cols-1)*gap <= 100cqw se cumple por construcción, para ambos ejes. */
  --cell: min(
    (100cqw - (var(--cols) - 1) * var(--gap)) / var(--cols),
    (100cqh - (var(--rows) - 1) * var(--gap)) / var(--rows)
  );
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--cell));
  grid-template-rows: repeat(var(--rows), var(--cell));
  gap: var(--gap);
  min-width: 0;
  min-height: 0;
}

/* .board-area ya tiene container-type: size, así que esto consulta su propia caja — sin
   container-name. Se re-evalúa en cada resize, incluido un toggle de F11. */
@container (aspect-ratio < 1) {
  .board {
    --cols: var(--cols-portrait);
    --rows: var(--rows-portrait);
  }
}

.card {
  position: relative; /* ambas caras van absolutas encima, ver §11 */
  min-width: 0;
  min-height: 0;
  overflow: clip;
  touch-action: none; /* §11: manipulation seguiría permitiendo pinch-zoom en el tablero */
}

.card-caption {
  font-size: clamp(0.7rem, 1.6vmin, 2rem);
}
```

### Orientación dinámica: landscape vs portrait

`Board` ya no recibe `cols`/`rows` fijos por nivel — los calcula en cada render, para
**ambas** orientaciones, con `shared/lib/computeGridDimensions.ts` (§20): busca el par de
factores de `pairs * 2` más cercano a un cuadrado y orienta el lado largo según el eje
pedido (columnas en landscape, filas en portrait). Ambos resultados se pasan como custom
properties (`--cols-landscape`, `--rows-landscape`, `--cols-portrait`,
`--rows-portrait`), y una **media query de contenedor** (`@container (aspect-ratio < 1)`)
elige cuál usar según la relación de aspecto real de `.board-area` — sin JavaScript, sin
`resize` listener, y reaccionando al instante a cualquier cambio de tamaño, incluido un
toggle de pantalla completa (F11). Es la misma técnica que ya resolvía el ajuste de celda:
CSS puro reaccionando al contenedor, no al viewport ni a un estado de React.

**Por qué no puede desbordar en ningún tamaño, para cualquier `cols`/`rows` calculado:**
`--cell` es el mínimo de las dos soluciones exactas, así que ambas desigualdades
(`cols·cell + (cols−1)·gap ≤ 100cqw` y lo mismo para filas) se cumplen a la vez, y
`container-type: size` garantiza que `100cqw`/`100cqh` los determina el layout flex, no el
contenido del tablero. El único modo de fallo es `cell ≤ 0`; en el peor caso soportado
(1024×600, grilla 5×4 del nivel difícil) la celda calculada da ≈139 px — muy por encima del
mínimo táctil de 64 px (§11). **Ese número se revalida si cambia `--shell-pad` o se agrega un
nivel con más columnas.**

**Decisión de layout (post-Etapa 1): header horizontal compacto arriba, no sidebar lateral.**
Con vidas/tiempo/puntaje en una franja delgada de altura fija (`flex: 0 0 auto`) sobre el
tablero — en vez de una columna lateral — casi todo el alto del viewport queda para el
tablero, que es lo crítico en pantallas 16:9 de altura ya escasa. El resto del contrato
(cálculo de `--cell`, `container-type: size`, `min-height: 0`) es idéntico; solo cambia el eje
de `.app-shell` de `row` a `column`. Si `container-type: size` da problemas en WebView2, la
salida de emergencia es aritmética de viewport pura, a costa de fijar el alto del header en
dos sitios: `--avail-h: calc(100dvh - var(--header-height) - 3 * var(--shell-pad))`.

**El error clásico sigue siendo el mismo:** olvidar `min-width`/`min-height: 0` en un hijo
flex o grid. Por defecto no se encoge por debajo del tamaño de su contenido, así que empuja
hacia afuera. Con `overflow: hidden` eso ya no se ve como scroll — se ve como una fila
recortada. Por eso el nuevo criterio de verificación (§16, §21) pide mirar la fila inferior
completa, no solo "que no haya barra".

**El caption va en overlay absoluto**, nunca en el flujo:

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

Si el nombre se insertara en el flujo al emparejar, la carta cambiaría de altura y toda la
grilla saltaría.

---

## 11. Reglas táctiles

El destino es una pizarra digital, con posibilidad de operarse por teclado cuando no hay
touch disponible. Seis reglas, todas obligatorias.

**1. Toques simultáneos.** Es el bug número uno de las pantallas grandes: dos personas (o
dos dedos) tocan cartas distintas en el mismo frame. Dos defensas, ambas necesarias — y una
tercera pieza, porque `<button>` exige que el teclado también funcione (regla 6):

```tsx
<button
  onPointerDown={(e) => {
    if (!e.isPrimary) return; // ignore secondary pointers at the event level
    e.preventDefault(); // suppress the synthetic click this pointerdown would fire
    onSelect(card.instanceId);
  }}
  onClick={(e) => {
    if (e.detail === 0) onSelect(card.instanceId); // detail===0 ⇒ keyboard-generated click
  }}
/>
```

`preventDefault()` en el `pointerdown` evita que el `onClick` sintético dispare una segunda
vez por el mismo toque; `e.detail === 0` aísla el `onClick` que sí viene de Enter/Espacio, sin
el cual el `<button>` de la regla 6 sería inaccesible por teclado.

```ts
// the reducer rejects impossible transitions — this is the real defense
case 'SELECT_CARD': {
  if (state.status !== 'PLAYING') return state;
  if (state.flipped.length >= 2) return state;
  const card = state.cards.find(c => c.instanceId === action.instanceId);
  if (!card || card.isFlipped || card.isMatched) return state;
  // ...
}
```

React encola los dispatches y el reducer procesa el segundo **contra el estado ya
actualizado por el primero**. Con `useState` separados, ambos handlers leerían el estado
viejo y tendrías tres cartas destapadas. Este es el argumento decisivo para R4.

**2. Nada de `:hover`.** En táctil el hover se queda pegado y deja cartas iluminadas
fantasma. Usar `:active` y feedback de presión (`scale(0.97)`).

**3. Gestos del navegador desactivados**, incluido el pinch-zoom sobre el propio tablero — un
gesto de dos dedos en la pizarra hace zoom y no hay chrome de navegador para deshacerlo, así
que `manipulation` no basta ahí: `.board` necesita `touch-action: none` (§10).

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

**4. Objetivos grandes.** Ningún control interactivo por debajo de 64×64 px. En una
pizarra de 75 pulgadas eso sigue siendo pequeño en términos físicos.

**5. Cartas como `<button>`, no `<div onClick>`.** Da foco visible, activación por
teclado y semántica correcta gratis — siempre que la regla 1 cablee también el `onClick`
de teclado, no solo el `onPointerDown` táctil.

**6. La carta no revela su pareja mientras está boca abajo.** Ambas caras del `<button>`
permanecen en el árbol de accesibilidad todo el tiempo — `backface-visibility` es solo un
efecto de pintado. El `aria-label` debe ser genérico ("Carta oculta") mientras
`isFlipped === false`, y solo pasar al nombre del lugar al emparejar. Esto aplica igual a la
carta con imagen real y al placeholder generado (§19): ninguno de los dos lleva el nombre del
lugar en texto o `alt` mientras la carta está boca abajo.

---

## 12. Pantalla completa

Web y escritorio se comportan distinto, así que va por puerto y adaptadores.

```ts
// platform/fullscreen/FullscreenPort.ts
export interface FullscreenPort {
  isFullscreen(): Promise<boolean>;
  toggle(): Promise<void>;
}
```

```ts
// platform/fullscreen/tauriFullscreen.ts
import { getCurrentWindow } from "@tauri-apps/api/window";

export const tauriFullscreen: FullscreenPort = {
  isFullscreen: () => getCurrentWindow().isFullscreen(),
  async toggle() {
    const win = getCurrentWindow();
    await win.setFullscreen(!(await win.isFullscreen()));
  },
};
```

```ts
// platform/fullscreen/index.ts
const isTauri = "__TAURI_INTERNALS__" in window;
export const fullscreen: FullscreenPort = isTauri
  ? tauriFullscreen
  : webFullscreen;
```

**El WebView de Tauri no tiene chrome de navegador, así que F11 no hace absolutamente
nada por defecto.** Hay que capturarlo. Y como una pizarra rara vez tiene teclado, el
botón en pantalla es la vía principal, no el atajo.

Requiere `core:window:allow-set-fullscreen` en las capabilities (§4). Sin ese permiso la
llamada falla en runtime, no en compilación.

La ventana también debe llevar `"zoomHotkeysEnabled": false` en `tauri.conf.json` — sin eso,
Ctrl+rueda o el pinch de dos dedos hace zoom sobre el WebView y no hay chrome de navegador
para deshacerlo (§11, regla 3).

---

## 13. Persistencia

**Un solo archivo, `scoreRepository.ts`, no un `ports/` + `infra/` separados.** La razón
original para separarlos —permitir migrar a `tauri-plugin-store` sin tocar componentes— sigue
siendo válida como _forma_: la interfaz `ScoreRepository` existe y es asíncrona de punta a
punta (esa API sí lo es; un puerto síncrono garantizaría el refactor que se quiere evitar).
Pero hoy hay **un solo backend real** — `localStorage`, que funciona igual en el navegador y
dentro del WebView de Tauri — así que separar el contrato de su única implementación en dos
carpetas es ceremonia sin beneficio todavía. El día que haga falta un segundo backend, se
bifurca en el mismo archivo por entorno, igual que `platform/fullscreen/index.ts` (§12). El
ranking (orden, desempate, tope de 20) sigue aparte en `domain/ranking.ts`: es una regla de
dominio, testeada una sola vez y compartida por cualquier backend futuro.

```ts
// features/leaderboard/scoreRepository.ts — contrato + única implementación, un archivo
export interface ScoreRepository {
  readonly load: (levelId: LevelId) => Promise<readonly ScoreEntry[]>;
  readonly save: (
    levelId: LevelId,
    entries: readonly ScoreEntry[],
  ) => Promise<void>;
}
```

```ts
// features/leaderboard/domain/ranking.ts — pure, tested
export const MAX_ENTRIES = 20;

export const rankWith = (
  existing: readonly ScoreEntry[],
  entry: ScoreEntry,
): readonly ScoreEntry[] =>
  [...existing, entry]
    .sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds) // desempate por tiempo
    .slice(0, MAX_ENTRIES);
```

```ts
// features/leaderboard/scoreRepository.ts (continuación) — implementación sobre localStorage
const key = (levelId: LevelId) => `flip-and-match:scores:${levelId}`;

// A corrupted key, a quota error, or a WebView with site data blocked must degrade to an
// empty board, never crash the Scores screen.
const isScoreEntry = (v: unknown): v is ScoreEntry =>
  typeof v === "object" &&
  v !== null &&
  "id" in v &&
  typeof v.id === "string" &&
  "score" in v &&
  typeof v.score === "number" &&
  "playerName" in v &&
  typeof v.playerName === "string";

export const scoreRepository: ScoreRepository = {
  async load(levelId) {
    try {
      const raw = globalThis.localStorage.getItem(key(levelId));
      if (raw === null) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isScoreEntry) : [];
    } catch {
      return [];
    }
  },
  async save(levelId, entries) {
    try {
      globalThis.localStorage.setItem(key(levelId), JSON.stringify(entries));
    } catch {
      // QuotaExceededError or a blocked storage context: the game must keep working
      // even if this particular score never lands.
    }
  },
};
```

Con `any` y `as` prohibidos (§14), `JSON.parse` siempre devuelve `unknown`: el type guard
`isScoreEntry` es obligatorio, no defensivo de más.

**Trampa:** `crypto.randomUUID()` solo existe en contextos seguros. Funciona en Tauri y en
HTTPS, pero es `undefined` si sirves el build web sobre HTTP plano en una IP de red local
— exactamente el escenario de una escuela. Usar un helper con fallback:

```ts
// shared/lib/createId.ts
export const createId = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
```

**Tabla Top 20 sin scroll:** veinte filas no entran junto al encabezado y las pestañas.
Con **más de 10** entradas se renderiza en dos columnas de diez (1–10 | 11–20). Con **10 o
menos** —el caso normal antes de que un nivel acumule muchas partidas— una sola columna,
más angosta y centrada, en vez de dejar una segunda columna vacía junto a la lista: dos
columnas ahí se leería como una tabla a medio llenar, no como un ranking.

**Podio con medalla, resto con estrella:** en `LeaderboardTable.tsx`, la fila 1 lleva 🥇, la
2 🥈, la 3 🥉 —con un fondo tintado en el color de su medalla— y de la 4 en adelante una ⭐
pequeña y apagada, solo como marcador de posición. Medallas emoji y no un ícono propio: el
oro/plata/bronce ya viene en el glifo, así que no hace falta inventar una paleta nueva para
lograrlo. El `<ol start={...}>` sigue existiendo para que un lector de pantalla anuncie el
orden real, pero su marcador visual se oculta (`list-style: none`) porque ahora es
redundante con la medalla o la estrella.

---

## 14. Convenciones de código

### Idioma

| Elemento                                         | Idioma                                        |
| ------------------------------------------------ | --------------------------------------------- |
| Nombres de variables, funciones, tipos, archivos | Inglés                                        |
| Comentarios                                      | Inglés                                        |
| Mensajes de commit                               | Inglés                                        |
| Textos visibles en la UI                         | Español, centralizados en `shared/copy/es.ts` |
| Documentación del repo                           | Español                                       |

Ningún texto en español aparece en un componente. Todo sale de `copy/es.ts`. Eso mantiene
el código en un solo idioma y deja la traducción abierta para v1.1 sin refactor.

### Política de comentarios

Los comentarios explican **por qué**, nunca **qué**. El código ya dice qué hace.

Comentar solo en estos cuatro casos:

1. **Una restricción no obvia se está satisfaciendo.**
   `// min-height:0 lets this flex child shrink below its content size`
2. **Una guarda previene un bug real.**
   `// reject non-primary pointers: touch boards fire simultaneous taps`
3. **Un número mágico tiene una razón.**
   `// 900ms: players need longer to memorize on a wall-sized display`
4. **Un contrato público en `ports/`** — una o dos líneas describiendo la responsabilidad.

Nunca:

- Comentarios que repiten la línea (`// increment counter`)
- JSDoc con `@param` en cada función interna
- Banderas de sección (`// ===== HELPERS =====`)
- Código comentado (para eso está git)
- `TODO` sin nombre y fecha

**Densidad objetivo: como mucho un comentario cada 15–20 líneas.** Si un archivo tiene un
comentario sobre cada función, está sobre-comentado y hay que borrar la mitad.

### TypeScript

- `strict: true` más `noUncheckedIndexedAccess: true`. Sin excepciones — se activa desde la
  Etapa 0, no a mitad de proyecto: activarlo tarde produce decenas de errores de golpe en
  cualquier acceso por índice (`array[i]`, `state.flipped[0]`) que hasta entonces se veía
  como `T` y en realidad siempre fue `T | undefined`.
- `verbatimModuleSyntax: true`. Junto con `isolatedModules` obliga a `import type` en todo
  import de solo-tipo, que es lo que hace verificable a simple vista la regla "`domain/` no
  importa nada del proyecto" — un `import type` se borra en compilación.
- `erasableSyntaxOnly: true`. Prohíbe enums, namespaces y parámetros de constructor con
  modificador — nada que el proyecto use de todas formas, así que es gratis.
- **`any` prohibido.** Si de verdad no se conoce el tipo, `unknown` más un type guard.
- Sin aserciones `as` salvo `as const`. Un `as Foo` es casi siempre un tipo mal modelado.
- Uniones discriminadas para el estado, no booleanos sueltos. `status: 'PREVIEW' | ...`
  hace imposibles los estados inválidos; `isLoading` + `isError` + `isPreview` los permite.
- Props y estructuras de dominio `readonly`.
- `satisfies` para configuración estática, `interface` para formas de objeto, `type` para
  uniones.

### React 19

- **No escribir `useMemo`, `useCallback` ni `React.memo`.** Con React Compiler activo,
  memoizar a mano no solo sobra: a veces pelea con el análisis del compilador y produce
  peor resultado. Solo se justifica ante un problema de rendimiento medido.
- `useReducer` para el estado del juego. `useState` solo para estado local trivial de UI.
- Componentes puros. Nada de mutación durante el render, nada de refs leídas en render.
- Un componente, una responsabilidad. Si un archivo pasa de ~150 líneas, se parte.
- Limpiar siempre en `useEffect`: todo `setInterval` y todo `addEventListener` devuelve su
  cleanup. Es la fuga de memoria más común al cambiar de nivel.

### Cronómetro

```ts
// Interval only triggers the re-render; elapsed time comes from the clock.
// A counter that adds +1 per tick drifts several seconds over a long game,
// and the score depends on it.
//
// Gate on startedAt/isFinished, not status === "PLAYING": every pair triggers a 600-900ms
// EVALUATING_MATCH/EVALUATING_MISS lockout (§7), so a PLAYING-only gate stops the visible
// clock 15-20 times per game — on a wall display that reads as the app hanging, even though
// the score (elapsed = now - startedAt) stays correct underneath.
useEffect(() => {
  if (startedAt === null || isFinished(status)) return;
  const id = setInterval(
    () => dispatch({ type: "TICK", now: performance.now() }),
    250,
  );
  return () => clearInterval(id);
}, [startedAt, status]);
```

### Assets

- Imágenes de lugares: **WebP, 1000 px en el lado largo, calidad 80.** Alrededor de 130 KB
  cada una; 2.6 MB por las veinte. Una pizarra 4K con grilla 5×4 muestra cartas de ~370 px;
  1000 px cubre eso con margen de sobra. A 1080 px en PNG estarías metiendo 16 MB en el
  `.exe` sin ganancia visual alguna.
- Reverso de carta: CSS puro (degradado + `"?"`), sin SVG ni bitmap — ver §9.
- Nombres de archivo en kebab-case, iguales al `id` de la ficha: `machu-picchu.webp`.
- Logo de la app: `app-icon.png` (raíz del proyecto, 1024×1024, mismo archivo que genera
  los íconos de `src-tauri/icons/`) se copia a `src/assets/logo.png` y se importa desde ahí
  — así Vite lo procesa y hashea como cualquier otro asset del bundle. Se usa en el badge
  circular del menú (`MenuScreen`) y ya estaba wireado como favicon desde la Etapa 0.
- **Precargar y decodificar durante `PREVIEW`, sin bloquear la partida.** Sin esto hay
  parpadeo en el primer volteo. Pero no debe ser un `await` en el camino crítico: con
  imágenes presentes en un disco lento, esperar el `Promise.all` retendría al jugador; y hoy,
  con `public/images/places/` vacío (§19), cada `decode()` rechaza casi de inmediato de
  cualquier forma. Fire-and-forget:

```ts
void Promise.all(
  cards.map((c) => {
    const img = new Image();
    img.src = c.place.imageUrl;
    return img.decode().catch(() => undefined); // decode errors must not block the game
  }),
);
```

---

## 15. Testing

Solo se testea `features/*/domain/`. Es TypeScript puro, corre en milisegundos y ahí está
todo lo que puede romperse en silencio. No hay tests de componentes en el MVP.

`vitest.config.ts` va **separado** de `vite.config.ts`: reutilizar este último arrastraría el
pase de babel de React Compiler y el plugin de Tailwind a cada corrida de test, sin ningún
beneficio para código que no toca React ni CSS. `environment: 'node'` (sin DOM), `include:
['src/**/*.test.ts']` — cubre `domain/` y también las invariantes de `config/levels.ts` y
`catalog/places.data.ts`, que son igualmente TypeScript puro aunque vivan un nivel fuera de
`domain/` — `defineConfig` importado de `vitest/config`.

Casos mínimos en `gameReducer`:

- `SELECT_CARD` durante `PREVIEW` no cambia el estado
- `SELECT_CARD` durante `EVALUATING_MATCH` o `EVALUATING_MISS` no cambia el estado
- `SELECT_CARD` durante `VICTORY` o `DEFEAT` no cambia el estado
- La tercera carta es rechazada
- Una carta ya volteada es rechazada
- Una carta ya emparejada es rechazada
- Un par coincidente incrementa `matches`, no `misses`, y pasa a `EVALUATING_MATCH` con
  ambas cartas ya marcadas como emparejadas
- Un par no coincidente incrementa `misses` de inmediato y pasa a `EVALUATING_MISS`;
  `RESOLVE_PAIR` es quien efectivamente vuelve a tapar ambas cartas
- Con `maxLives: 3`, fallar con `misses === 2` (`livesRemaining() === 1`) resuelve a
  `DEFEAT` al fallar una vez más — no antes, no después
- Con `maxLives: null`, ningún número de fallos lleva a `DEFEAT`
- Emparejar el último par **con vidas restantes, o con `maxLives: null`** lleva a `VICTORY`
- Un fallo que agota la última vida resuelve a `DEFEAT`, sin importar cuántos pares queden
  sin emparejar — nunca se declara `VICTORY` por descarte
- `livesRemaining()` (selector, no campo de estado) nunca baja de 0
- Con `preview.enabled: false`, `START` deja el estado en `PLAYING` con `startedAt` ya
  fijado, sin pasar por `PREVIEW`
- `END_PREVIEW` fuera de `PREVIEW` no cambia el estado (idempotencia bajo doble-invocación
  de `StrictMode`)

En `buildDeck`:

- Devuelve exactamente `pairs * 2` cartas
- Cada `place.id` aparece exactamente dos veces — nunca tres de uno y una de otro
- Todos los `instanceId` son únicos
- No repite el mazo anterior cuando el catálogo lo permite

En `levels` (invariante de nivel, §20):

- `pairs` aumenta con la dificultad, en el orden de `LEVEL_IDS`

En `computeGridDimensions` (§10, §20):

- `cols * rows === totalCards`, para ambas orientaciones
- landscape: `cols >= rows`; portrait: `rows >= cols`
- reproduce los pares conocidos: 12→4×3 landscape / 3×4 portrait, 18→6×3 / 3×6, 20→5×4 / 4×5

En `places.data` (invariante de catálogo, §20):

- Todos los `id` son únicos
- `catalog.length >= max(pairs)` sobre todos los niveles (≥ 12 para el nivel difícil)

En `scoring`:

- Nunca devuelve negativo
- Partida perfecta instantánea da 10000

En `ranking`:

- El Top 20 queda ordenado por puntaje descendente y, en empate, por menor tiempo
- Nunca supera `MAX_ENTRIES` entradas

---

## 16. Plan por etapas

Cada etapa tiene un criterio de cierre verificable. No se avanza sin cumplirlo.

La **Etapa 0** (scaffold compilando, tipado, linteado y empaquetable — sin código de juego
todavía) se documenta y ejecuta por separado, antes de la Etapa 1. Su alcance y checklist de
cierre viven fuera de este documento.

### Etapa 1 — Dominio puro · ~5 h

`shuffle`, `buildDeck`, `gameReducer` (con `EVALUATING_MATCH`/`EVALUATING_MISS`, §7),
`lives.ts`, `scoring`, `ranking`, `levels`, `places.data`, `gameSettings.ts` (§19). Cero
React en esta etapa.

> **Cierre:** toda la lista de tests corregida de §15 en verde, incluidas las invariantes de
> nivel y catálogo de §20. Se puede jugar una partida completa desde un test, sin interfaz.

### Etapa 2 — Layout sin scroll, carta 3D y fallback de imagen · ~9 h

Shell con sidebar. Contrato CSS corregido de §10. `CardItem` con `preserve-3d` y
`backface-visibility`. Reverso tejido con desplazamiento de tono. `PlaceImage` +
`PlacePlaceholder` (§19) — **con `public/images/places/` vacío**, no después. Precarga
fire-and-forget. Volteo en cascada al salir de `PREVIEW` (y ninguno si `preview.enabled` es
`false`).

> **Cierre:** redimensionar la ventana desde 1024×600 hasta 3840×2160 y **ver siempre
> completa la fila inferior de cartas**, con la carpeta de imágenes vacía. Es el criterio más
> importante del proyecto.

### Etapa 3 — Emparejado, vidas y modales · ~6 h

Estado visual de carta emparejada. Caption en overlay animado. Sidebar con vidas visibles
durante toda la partida (oculto si `maxLives: null`), reloj que no se congela en cada
bloqueo (§14). `VictoryModal` con galería, puntaje e input de nombre. `DefeatModal` con el
resumen de la partida (vidas agotadas, aciertos, fallos, tiempo, puntaje) — **sin** input de
nombre ni botón de guardar.

> **Cierre:** recorrido completo por teclado (Tab + Enter/Espacio selecciona carta). Ningún
> lector de pantalla revela el nombre de un lugar mientras la carta está boca abajo.

### Etapa 4 — Persistencia · ~4 h

`ScoreRepository` asíncrono sobre localStorage (§13), con manejo de datos corruptos y de
cuota agotada. `rankWith` en dominio. `LeaderboardTable` en dos columnas con pestañas por
nivel. Solo las victorias llegan a guardarse.

> **Cierre:** guardar un puntaje, cerrar la app, reabrirla, y el puntaje sigue ahí. Corromper
> a mano la entrada de `localStorage` no rompe la pantalla de puntajes.

### Etapa 5 — Pulido táctil y build final · ~5 h

Puerto de fullscreen con ambos adaptadores. Botón visible + F11. `zoomHotkeysEnabled: false`.
Reglas táctiles de §11 (incluida la guarda de teclado en `SELECT_CARD`).
`prefers-reduced-motion`. `fullscreen: true` en `tauri.conf.json`. Prueba en la pizarra real.

> **Cierre:** alguien que nunca vio la app completa un nivel en la pizarra sin que nadie
> intervenga.

**Total estimado: 29 h de trabajo efectivo en estas cinco etapas**, más ~4 h de Etapa 0 ya
cubiertas aparte — **~33 h en total**, frente a las 28 h originales del documento previo a
estos requisitos.

---

## 17. Checklist de release

Ninguna versión sale sin todos los puntos.

**Layout**

- [ ] La fila inferior de cartas se ve completa de 1024×600 a 3840×2160, en las tres pantallas
      (no basta con "no aparece scroll" — `overflow: clip` lo vuelve un falso negativo, §10)
- [ ] `min-height: 0` y `min-width: 0` en todos los contenedores flex/grid del tablero y el sidebar
- [ ] El caption no provoca reflow al aparecer
- [ ] Cronómetro con `tabular-nums`
- [ ] El tablero es jugable y las cartas se ven distintas por par con `public/images/places/` vacío

**Táctil**

- [ ] Dos dedos simultáneos no destapan tres cartas
- [ ] Cero reglas `:hover` en elementos interactivos
- [ ] Sin zoom por doble toque ni por pinch en el tablero, sin selección de texto, sin menú contextual
- [ ] Todos los controles ≥ 64×64 px
- [ ] Cartas renderizadas como `<button>`, seleccionables por toque y por teclado (Tab + Enter/Espacio)
- [ ] Ningún lector de pantalla revela el nombre de un lugar en una carta boca abajo

**Lógica**

- [ ] Tests de dominio en verde, incluidas las invariantes de nivel y catálogo (§20)
- [ ] Cronómetro basado en `performance.now()`, no en contador acumulado, y no se congela en cada bloqueo
- [ ] `clearInterval`, `clearTimeout` y `removeEventListener` en todos los cleanups
- [ ] Cada partida usa un subconjunto aleatorio, sin repetir el mazo anterior, siempre con pares completos
- [ ] La última vida perdida dispara `DEFEAT` de forma consistente, sin importar cuántos
      pares queden por emparejar — `DEFEAT` se comprueba antes que `VICTORY`
- [ ] Con `maxLives: null`, ningún fallo dispara `DEFEAT`
- [ ] Solo una victoria puede guardar puntaje; el modal de derrota no ofrece esa opción
- [ ] Datos de `localStorage` corruptos degradan a tabla vacía, no rompen la pantalla de puntajes

**Build**

- [ ] `base: './'` verificado en el `.exe`, no solo en `pnpm dev`
- [ ] Solo existe `pnpm-lock.yaml` en el repo — sin `package-lock.json` ni `yarn.lock`
- [ ] Fuentes cargan con la máquina en modo avión (importadas desde `src/`, no copiadas a `public/fonts/`)
- [ ] Permiso `core:window:allow-set-fullscreen` presente
- [ ] Biome sin errores ni advertencias

---

## 18. Riesgos conocidos

| Riesgo                                         | Impacto    | Mitigación                                                                                     |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| El `.exe` no encuentra los assets              | Bloqueante | `base: './'` verificado en Etapa 0, no al final                                                |
| Toques simultáneos rompen el estado            | Alto       | Guarda doble (§11), cubierta por tests                                                         |
| Se recorta la fila inferior de cartas          | Alto       | Contrato CSS de §10, probado en el rango completo — "no scroll" por sí solo no basta           |
| WebView2 ausente en la PC destino              | Bloqueante | `webviewInstallMode: offlineInstaller` en `tauri.conf.json` (§4), no el bootstrapper           |
| Instalador MSI falla tras proxy escolar        | Medio      | `bundle.targets: ["nsis"]`, no `"all"` (§4)                                                    |
| Fuentes no cargan sin internet                 | Medio      | Importadas desde `src/`, nunca copiadas a `public/fonts/` (§9); verificado en modo avión       |
| El juego no es probable sin imágenes reales    | Alto       | Placeholder generado por lugar, determinista y jugable con `public/images/places/` vacío (§19) |
| Parpadeo en el primer volteo                   | Bajo       | `img.decode()` fire-and-forget durante `PREVIEW`                                               |
| El caption o el placeholder facilitan el juego | Bajo       | Se revela solo al emparejar; ambas caras llevan `aria-label` genérico boca abajo (§11)         |
| Cronómetro parece congelado                    | Medio      | Se gatilla por `startedAt`/`isFinished`, no por `status === 'PLAYING'` (§14)                   |

---

## 19. Configuración del juego

Preview, vidas y los tiempos de bloqueo son **valores de configuración**, no constantes
dispersas en el reducer. Viajan en `GameState.settings` y se inyectan en la acción `START` —
el reducer sigue sin importar el módulo de configuración, así que R8 se mantiene y los tests
pueden variar los ajustes sin mockear nada.

**Decisión de alcance del MVP:** "configurable" significa un archivo fuente
(`config/gameSettings.ts`), editado y recompilado — no una pantalla de ajustes dentro de la
app. El modelado de tipos es el mismo en ambos casos, así que una pantalla de ajustes futura
(v1.1+) sería una adición pura sobre este diseño: se conectaría `useSettings()` a
`useMemoryGame(levelId, settings)` sin tocar el reducer ni `GameSettings`.

```ts
// features/memory-game/domain/types.ts
export interface GameSettings {
  readonly preview: {
    readonly enabled: boolean;
    readonly durationMs: number;
  };
  /** null disables the defeat condition entirely: no lives, no DEFEAT. */
  readonly maxLives: number | null;
  readonly matchLockoutMs: number;
  readonly missLockoutMs: number;
}
```

```ts
// features/memory-game/config/gameSettings.ts
export const DEFAULT_GAME_SETTINGS = {
  preview: { enabled: true, durationMs: 2000 },
  maxLives: 3,
  matchLockoutMs: 600, // matches the caption entrance animation
  missLockoutMs: 900, // viewers stand far from a wall display and need longer
} as const satisfies GameSettings;
```

Cambiar el comportamiento del juego es editar este archivo, no el reducer ni los componentes.
No hay pantalla de ajustes en el MVP — es una decisión explícita, ver §16.

### `preview.enabled: false`

`START` decide el estado inicial según el flag: sin preview, el juego arranca directo en
`PLAYING` con las cartas boca abajo y el cronómetro corriendo desde `now`.

```ts
case "START": {
  const preview = action.settings.preview.enabled;
  return {
    levelId: action.levelId,
    settings: action.settings,
    status: preview ? "PREVIEW" : "PLAYING",
    cards: action.cards.map((c) => ({ ...c, isFlipped: preview, isMatched: false })),
    flipped: [], matches: 0, misses: 0,
    startedAt: preview ? null : action.now,
    elapsedMs: 0,
  };
}
```

`END_PREVIEW` debe ser idempotente (`if (state.status !== "PREVIEW") return state`), porque
`StrictMode` invoca los efectos dos veces en desarrollo.

### `maxLives: number | null` — vidas como dato derivado

`livesRemaining` **no vive en `GameState`**: siempre vale `maxLives - misses`, sin excepción,
y guardarlo por separado es un desincronizado esperando a ocurrir. Es un selector puro:

```ts
// domain/lives.ts — null means unlimited
export const livesRemaining = (state: GameState): number | null =>
  state.settings.maxLives === null
    ? null
    : Math.max(0, state.settings.maxLives - state.misses);
```

Con `maxLives: null` ningún fallo lleva a `DEFEAT` — es el modo práctica/exhibición.
`GameSidebar` dibuja los corazones solo si `settings.maxLives !== null`; con vidas ilimitadas
el bloque no se renderiza. Las vidas van **visibles durante toda la partida** (arriba del
sidebar, ver §10) y el modal de derrota repite el resumen: vidas agotadas, aciertos, fallos,
tiempo y puntaje.

`DEFEAT` se comprueba **antes** que `VICTORY` al resolver un par: un fallo que agota la
última vida nunca resuelve a victoria, aunque fuera el último par (RF-09).

### Cómo se encuadra una foto en la carta

Las fotos reales llegan con cualquier tamaño y cualquier relación de aspecto (verticales,
apaisadas, cuadradas), y la celda es siempre **cuadrada**. `PlaceImage` usa
`object-fit: cover` de forma directa —sin capa de fondo difuminado—: la foto llena la celda
por completo en ambos ejes, recortando lo que sobre pero conservando su propia relación de
aspecto, igual en la carta, la miniatura de la galería y el modal de detalle. Una versión
anterior usaba `contain` más una copia difuminada y sobre-escalada para rellenar el espacio
sobrante; se descartó porque el desenfoque se leía como un error visual, no como una
decisión de diseño.

### Estado de carga

`PlaceImage` distingue tres estados con `useState`: cargando, cargada y fallida. Mientras
`<img onLoad>` no ha disparado, el contenedor (`data-loaded="false"`) muestra un degradado
animado (`background-position` en bucle, `prefers-reduced-motion` lo apaga) en vez de un
hueco en blanco; al cargar, la foto entra con una transición de opacidad de 280ms. Esto
solo se nota en la **primera visita real** —el service worker (§22) precachea las 21 fotos,
así que cualquier carga posterior las resuelve casi al instante y el degradado no llega a
animarse ni una vez. `loading="lazy" decoding="async"` en el `<img>` es una segunda capa de
buena práctica, aunque en el tablero (siempre visible por completo) su efecto es mínimo.

### Fallback cuando falta la imagen

`PlaceImage` mantiene el `onError` → `PlacePlaceholder`: un SVG generado por lugar con color
derivado por hash del `id`, determinista. Ya no es el modo normal de juego (las 21 fotos
están en `public/images/places/`), pero sigue siendo la red de seguridad si un archivo se
renombra o no se copia al empaquetar.

Por qué funciona sin trampas:

- **Determinista por `id`** → las dos cartas del par se ven idénticas; el tablero sigue
  siendo emparejable aunque falten todas las imágenes.
- El SVG lleva `aria-hidden="true"` — el nombre lo aporta el `aria-label` del `<button>`
  contenedor, que es genérico ("Carta oculta") mientras la carta está boca abajo. Es la misma
  regla que protege a las imágenes reales: ambas caras de la carta están siempre en el árbol
  de accesibilidad (`backface-visibility` es solo un efecto de pintado), así que un
  `alt={place.name}` fijo filtraría los pares a cualquier lector de pantalla.
- Las dos ramas comparten `.place-image` (`position: absolute; inset: 0`), así que el cambio
  es geométricamente idéntico: **cero salto de layout por construcción**.
- Sin registro de "qué imágenes existen" en tiempo de ejecución — `onError` basta. La
  verificación real la hace un test (§20), que es donde un archivo faltante debe fallar.

El precargado de §14 sigue existiendo pero **no bloquea la partida**: es fire-and-forget, no
un `await` en el camino crítico.

---

## 20. Catálogo y la invariante de pares

El catálogo debe garantizar, por construcción y no solo por test, que **siempre hay
exactamente dos copias de cada lugar** en el mazo — un desbalance (tres copias de un lugar,
una de otro) deja el tablero irresoluble.

```ts
// features/memory-game/domain/buildDeck.ts
const deck = chosenPlaces.flatMap((place) => [
  { instanceId: `${place.id}#0`, place, isFlipped: false, isMatched: false },
  { instanceId: `${place.id}#1`, place, isFlipped: false, isMatched: false },
]);
return shuffle(deck, rng);
```

Un `flatMap` que siempre emite dos cartas por lugar hace el desbalance irrepresentable. Los
`instanceId` se derivan del `id` — únicos por construcción, sin necesidad de `createId()`.

Invariantes verificadas en tests (§15):

- **Grilla:** `cols * rows === totalCards` para ambas orientaciones, en `computeGridDimensions`.
- **Catálogo:** todos los `id` son únicos (un `id` repetido produciría cuatro cartas del mismo
  lugar) y `catalog.length >= max(pairs)` sobre todos los niveles — al menos **12 lugares**
  para el nivel difícil.
- **Imágenes:** cada `imageUrl` del catálogo apunta a un archivo que **existe** en
  `public/images/places/`, y ningún archivo de esa carpeta queda sin usar. Es la única
  invariante que nada más puede detectar: un `id` mal escrito o una extensión cambiada no
  produce ningún error, solo dibuja el placeholder genérico — que parece una decisión de
  diseño. El test lo resuelve con `import.meta.glob` (relativo a la raíz de Vite, así que no
  depende del directorio de trabajo, y no arrastra tipos de Node al `tsconfig` del navegador).
- **Rutas ASCII:** ninguna `imageUrl` lleva ñ ni tildes. Un `baños-del-inca.webp` funciona
  perfectamente en `pnpm dev` y falla **solo dentro del .exe**, donde la ruta tiene que
  sobrevivir a `tauri.localhost` y al instalador NSIS.

"No repite el mazo anterior" (RF-03) se implementa como parámetro puro
`previousPlaceIds: readonly string[]`, con reintento acotado a 10 intentos antes de aceptar
el resultado — nunca un bucle abierto.

### Catálogo de lanzamiento

21 lugares, uno por archivo en `public/images/places/`. La carpeta mezcla `.jpg` y `.webp`,
así que `imageUrl` **lleva la extensión literal** en vez de derivarla del `id`: derivarla
haría un 404 silencioso en la mitad del mazo. El `id` es el nombre base del archivo, en
kebab-case ASCII.

| `id`                        | Nombre                       | Archivo |
| --------------------------- | ---------------------------- | ------- |
| `banos-del-inca`            | Baños del Inca               | `.webp` |
| `canon-del-colca`           | Cañón del Colca              | `.jpg`  |
| `chan-chan`                 | Chan Chan                    | `.jpg`  |
| `cuarto-de-rescate`         | Cuarto del Rescate           | `.jpg`  |
| `cumbemayo`                 | Cumbemayo                    | `.jpg`  |
| `granja-porcon`             | Granja Porcón                | `.webp` |
| `huaca-del-sol-y-luna`      | Huacas del Sol y la Luna     | `.jpg`  |
| `huacachina`                | Huacachina                   | `.jpg`  |
| `kuntur-wasi`               | Kuntur Wasi                  | `.jpg`  |
| `lago-titicaca`             | Lago Titicaca                | `.jpg`  |
| `laguna-de-humantai`        | Laguna Humantay              | `.jpg`  |
| `laguna-san-nicolas`        | Laguna San Nicolás           | `.jpg`  |
| `lineas-de-nazca`           | Líneas de Nazca              | `.jpg`  |
| `machu-picchu`              | Machu Picchu                 | `.jpg`  |
| `monasterio-santa-catalina` | Monasterio de Santa Catalina | `.jpg`  |
| `montana-7-colores`         | Montaña de 7 Colores         | `.jpg`  |
| `parque-nacional-huascaran` | Parque Nacional Huascarán    | `.jpg`  |
| `plaza-mayor-de-lima`       | Plaza Mayor de Lima          | `.jpg`  |
| `sacsayhuaman`              | Sacsayhuamán                 | `.jpg`  |
| `santa-apolonia`            | Cerro Santa Apolonia         | `.jpg`  |
| `ventanilla-de-otuzco`      | Ventanillas de Otuzco        | `.jpg`  |

Pendiente para después del MVP: normalizar todo a `.webp` y bajar el peso — hoy la carpeta
son ~7 MB y se copia entera al bundle. No bloquea nada, pero el instalador lo nota.

Cada lugar lleva además `location` (departamento, ej. "Cajamarca, Perú") y `description`
—una tupla de exactamente dos párrafos— con la reseña histórica que muestra el modal de
detalle (§21). Dos invariantes más viven junto a las de arriba: `location` no vacío y
`description` con sus dos párrafos no vacíos, para que un dato faltante falle el test en
vez de dejar el modal con un hueco en blanco.

---

## 21. Modal de detalle de lugar

Al tocar una foto en la galería de "lugares aprendidos" (victoria o derrota, §12) se abre
un segundo modal con la foto completa arriba y, debajo, el nombre, la ubicación y la reseña
del lugar en dos párrafos.

```
┌───────────────────────────────────────┐
│                                  [ ✕ ] │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │               foto                │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│  Machu Picchu                          │
│  📍 Cusco, Perú                        │
│                                         │
│  Párrafo 1 (~3 líneas)…                │
│                                         │
│  Párrafo 2 (~3 líneas)…                │
└───────────────────────────────────────┘
```

Es un `modal-overlay` **independiente**, no anidado dentro del `Modal` de victoria/derrota:
se abre y se cierra por su cuenta (`useState<TouristPlace | null>` en `PlaceGallery.tsx`)
sin que el modal exterior sepa que existe. Para que ambos overlays convivan sin pelear por
la capa visual, este lleva `z-index: 200` contra el `100` del overlay exterior (§10) — más
alto siempre gana, sin importar que este sea un descendiente profundo en el DOM del primero.

**El fondo (backdrop) es un `<button>`, hermano del panel, no su padre.** La alternativa
obvia —un `onClick` en el overlay que cierra, y un `stopPropagation()` en el panel para que
un clic dentro no lo cierre— falla el lint de accesibilidad (`noStaticElementInteractions`,
`useKeyWithClickEvents`) porque un `<div>` con `onClick` no es operable por teclado. Con el
backdrop como botón absoluto (`inset: 0`) por debajo del panel en el DOM, un clic dentro del
panel simplemente nunca llega al backdrop —son hermanos, no hay nada que interceptar— y un
botón nativo ya es operable por teclado y lector de pantalla sin código extra.

La imagen reutiliza `PlaceImage` (§19): mismo `object-fit: cover` y mismo degradado de
carga que en el tablero, así que una foto vertical o apaisada se ve igual de completa aquí
que en la carta.

**Siempre una sola columna** —foto arriba, texto abajo— en cualquier ancho, no solo en
pantallas angostas: una fila lado a lado apretaba tanto la foto como los dos párrafos a la
mitad del panel cada uno. El panel es más ancho (`min(1024px, 100%)`) que el resto de
modales de la app para darle a la reseña espacio real de lectura. El alto **no es fijo**:
se ajusta al contenido hasta un `max-height` relativo al viewport (`95vh`, `96vh` por
debajo de 1024px de ancho) — así una reseña corta no arrastra espacio vacío y una larga
solo activa scroll cuando de verdad no cabe, nunca antes. `overflow-x: clip` en el panel es
puramente defensivo (nada dentro desborda hoy), pero una foto en `cover` pegada a una
esquina redondeada no es el sitio para confiar en que la aritmética del ancho siempre da
exacta.

---

## 22. PWA — instalable y jugable sin conexión

Solo aplica al **build web** (Vercel). El `.exe` de Tauri ya es una app de escritorio
instalada y sin dependencia de red; `platform/pwa/` detecta el entorno con el mismo patrón
que `platform/fullscreen` (`"__TAURI_INTERNALS__" in window`) y no hace nada ahí.

```
src/platform/pwa/
├── registerPwa.ts       # registra el service worker — no-op en Tauri
├── useInstallPrompt.ts  # captura beforeinstallprompt, expone canInstall + promptInstall
└── index.ts
```

**Generación:** `vite-plugin-pwa` en modo `generateSW` (Workbox), configurado en
`vite.config.ts`. `globPatterns` incluye `webp,jpg,jpeg,png,svg,woff2` además de
`js,css,html,ico` — sin eso, el precaché cubriría el bundle de la app pero no las 21 fotos,
y "jugable sin conexión" sería falso a medias. `maximumFileSizeToCacheInBytes` se sube a
5 MB (el default de Workbox es 2 MB); ningún archivo individual se acerca a ese límite hoy
(el más grande son ~654 KB), pero el default habría fallado en silencio ante una foto futura
más pesada. Precaché medido: 38 entradas, ~8.2 MB.

**Registro manual, no automático:** `injectRegister: null` en la config del plugin — el
registro ocurre en `registerPwa()` (llamado una vez desde `main.tsx`) en vez del script que
el plugin inyectaría solo, para poder aplicar el chequeo de entorno de arriba en un único
lugar en vez de depender de que el HTML generado nunca cambie. `registerType: "autoUpdate"`
actualiza el service worker sin pedir confirmación: una versión vieja sirviendo en silencio
un build de la semana pasada es peor que una recarga que el jugador ni nota entre partidas.

**Íconos:** generados una sola vez con `@vite-pwa/assets-generator` (preset
`minimal2023Preset`) a partir de `app-icon.png` en la raíz — `pwa-assets.config.ts` deja el
comando reproducible (`pnpm dlx @vite-pwa/assets-generator`) para cuando el logo cambie. La
salida (`pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`,
`maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`) vive en
`public/`, referenciada tanto desde el manifest como desde `index.html`.

**Botón de instalar:** `useInstallPrompt` escucha `beforeinstallprompt`, llama
`event.preventDefault()` para suprimir el mini-infobar propio del navegador y guarda el
evento diferido — `canInstall` se vuelve `true` recién ahí, nunca antes, porque el navegador
decide cuándo el sitio califica (no hay forma de forzarlo). El banner
(`MenuScreen.tsx`) es `position: fixed; top: 0`, no el primer hijo de `.menu-screen`: esa
pantalla centra su columna verticalmente, así que un hijo normal habría flotado hacia el
medio junto con el resto en vez de leerse como "arriba". Detecta instalación previa por
`display-mode: standalone` (Chromium/Edge) y `navigator.standalone` (Safari/iOS, que nunca
dispara `beforeinstallprompt`), para no ofrecer instalar lo ya instalado.

---

_Última revisión: julio 2026._
