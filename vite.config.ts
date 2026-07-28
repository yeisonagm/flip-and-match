import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  base: "./", // R3 — the packaged .exe resolves assets relatively; absolute paths 404 silently
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
    tailwindcss(),
    // Only meaningful for the web build (Vercel): the Tauri .exe is already an installed,
    // offline-capable desktop app and doesn't need a service worker on top of that. The
    // registration itself (platform/pwa) additionally no-ops inside Tauri at runtime, the
    // same environment-detection pattern platform/fullscreen already uses — this build-time
    // config just controls what vite-plugin-pwa emits into the bundle either way.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // registered manually in platform/pwa/index.ts, not auto-injected
      manifest: {
        name: "Descubre Perú",
        short_name: "Descubre Perú",
        description: "Memoria de lugares turísticos del Perú",
        lang: "es",
        start_url: ".",
        scope: ".",
        display: "standalone",
        theme_color: "#0e8a9c",
        background_color: "#eaf7fb",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precaches every place photo and font too, not just app code — RF says the game
        // must be fully playable offline after the first load, so the 21 photos (~7MB
        // total, largest ~650KB) have to be in the precache list, not just app bundles.
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  build: {
    // Tailwind v4's floor (@property, color-mix()) — WebView2 clears chrome111 comfortably.
    target: "chrome111",
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
