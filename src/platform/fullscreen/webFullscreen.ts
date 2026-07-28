import type { FullscreenPort } from "./FullscreenPort";

export const webFullscreen: FullscreenPort = {
  isFullscreen: () => Promise.resolve(document.fullscreenElement !== null),
  async toggle() {
    if (document.fullscreenElement !== null) {
      await document.exitFullscreen();
      return;
    }
    // A rejection here (permission denied, no user gesture) must not crash the caller —
    // the on-screen button and F11 are both real user gestures, but stay defensive.
    await document.documentElement.requestFullscreen().catch(() => undefined);
  },
};
