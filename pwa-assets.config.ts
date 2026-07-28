import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// One-off generator, not part of the build: `pnpm dlx @vite-pwa/assets-generator` reads
// this to produce every icon size vite-plugin-pwa's manifest references, from the single
// source logo at the repo root. Re-run it only if app-icon.png changes.
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: minimal2023Preset,
  images: ["app-icon.png"],
});
