import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Separate from vite.config.ts on purpose: domain tests never touch React or CSS, so
// dragging in the React Compiler babel pass and the Tailwind plugin would only slow
// every test run for nothing.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Domain logic proper, plus the pure config/catalog invariants (level shape, no
    // duplicate places) that live just outside domain/ — never a .test.tsx, since this
    // project has no component tests.
    include: ["src/**/*.test.ts"],
    globals: false,
    // Stage 0 ships no domain code yet — an empty suite must exit 0 so `pnpm test`
    // proves Vitest is wired up rather than failing before any feature work starts.
    passWithNoTests: true,
  },
});
