# Flip & Match

Juego de memoria educativo sobre lugares turísticos del Perú. Pensado para pizarra digital
o TV táctil; corre como ejecutable de escritorio (Tauri) y como build web estático.

> La fuente de verdad del proyecto —alcance, arquitectura, reglas de juego y justificaciones
> de diseño— es [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md). Este README es solo la
> puerta de entrada para clonar y correr.

## Stack

| Herramienta  | Versión |
| ------------ | ------- |
| pnpm         | 11.17.0 |
| Node         | 22.x    |
| React        | 19.2.x  |
| TypeScript   | 5.8.x   |
| Vite         | 7.x     |
| Tailwind CSS | 4.x     |
| Tauri        | 2.x     |
| Vitest       | 4.x     |
| Biome        | 2.x     |

## Requisitos

- Node 22+ y [pnpm](https://pnpm.io) (vía `corepack enable && corepack prepare pnpm@latest --activate`).
- Toolchain de Rust (`rustup`) — necesario para compilar el `.exe` con Tauri.
- Windows: [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (viene preinstalado en Windows 11 y en la mayoría de Windows 10 actualizados).

**Nunca uses `npm install` ni `yarn add` en este proyecto.** Solo se versiona
`pnpm-lock.yaml`; un `package-lock.json` o `yarn.lock` crea un segundo árbol de dependencias
que diverge del real.

## Puesta en marcha

```bash
pnpm install
```

```bash
pnpm dev          # servidor web en localhost:1420, sin Tauri
```

```bash
pnpm tauri dev    # app de escritorio, con recarga en caliente
```

## Scripts

| Script             | Qué hace                                      |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Servidor de desarrollo Vite                   |
| `pnpm build`       | Type-check + build web a `dist/`              |
| `pnpm preview`     | Sirve el build de `dist/` localmente          |
| `pnpm tauri dev`   | App de escritorio en modo desarrollo          |
| `pnpm tauri build` | Genera el instalador `.exe` (NSIS)            |
| `pnpm test`        | Corre los tests de dominio (Vitest)           |
| `pnpm typecheck`   | Verifica tipos sin emitir (`tsc -b --noEmit`) |
| `pnpm lint`        | Revisa el código con Biome                    |
| `pnpm format`      | Aplica el formato de Biome                    |

## Configuración del juego

Preview, vidas y los tiempos de bloqueo se ajustan editando un solo archivo —
[`src/features/memory-game/config/gameSettings.ts`](./src/features/memory-game/config/gameSettings.ts)—
y recompilando. No hay pantalla de ajustes dentro de la app en esta versión.

| Variable             | Tipo             | Por defecto | Efecto                                                                    |
| -------------------- | ---------------- | ----------- | ------------------------------------------------------------------------- |
| `preview.enabled`    | `boolean`        | `true`      | Si es `false`, la partida arranca directo con las cartas boca abajo       |
| `preview.durationMs` | `number`         | `1500`      | Duración de la vista previa, en milisegundos                              |
| `maxLives`           | `number \| null` | `3`         | Fallos permitidos antes de perder. `null` = vidas ilimitadas, sin derrota |
| `matchLockoutMs`     | `number`         | `600`       | Bloqueo de entrada tras un acierto                                        |
| `missLockoutMs`      | `number`         | `900`       | Bloqueo de entrada tras un fallo                                          |

## Estructura

```
src/
├── app/               # Máquina de pantallas (Menú, Juego, Puntajes) — sin router
├── features/
│   ├── catalog/       # Catálogo de lugares turísticos
│   ├── memory-game/   # Reglas del juego: dominio, config, hooks, componentes
│   └── leaderboard/   # Tabla de posiciones y persistencia de puntajes
├── platform/          # Adaptadores por entorno (fullscreen web vs. Tauri)
├── shared/            # UI reutilizable, utilidades, textos en español
└── styles/            # Tokens de diseño y hoja de estilos global
```

## Agregar un lugar turístico

1. Exporta la imagen como **WebP, 1000 px en el lado largo, calidad 80**.
2. Guárdala en `public/images/places/<id-en-kebab-case>.webp`.
3. Agrega la entrada en `src/features/catalog/places.data.ts`, con el mismo `id` del archivo.

Si la imagen todavía no existe, la carta muestra un placeholder generado automáticamente
(inicial + color derivados del `id`) y el juego sigue siendo jugable — no hace falta agregar
las 20 imágenes para poder probar.

## Compilar el ejecutable

```bash
pnpm tauri build
```

El instalador NSIS queda en `src-tauri/target/release/bundle/nsis/`.

## Documentación

- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — alcance, arquitectura, reglas de
  juego y decisiones de diseño. Fuente de verdad del proyecto.
- [`.claude/skills/flip-and-match/SKILL.md`](./.claude/skills/flip-and-match/SKILL.md) — guía
  operativa para agregar código: dónde va cada cosa y qué convenciones seguir.
