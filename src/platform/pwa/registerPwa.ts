import { registerSW } from "virtual:pwa-register";

const isTauri = "__TAURI_INTERNALS__" in window;

// Auto-update, no user-facing "new version available" prompt: a stale cached bundle
// silently serving last week's build is worse than a reload the player doesn't notice
// between games. Tauri already ships one fixed build inside the .exe and has no use for
// a service worker on top of that, so this no-ops there — same environment-detection
// pattern platform/fullscreen uses.
export function registerPwa(): void {
  if (isTauri) return;
  registerSW({ immediate: true });
}
