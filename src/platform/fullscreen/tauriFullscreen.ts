import { getCurrentWindow } from "@tauri-apps/api/window";
import type { FullscreenPort } from "./FullscreenPort";

export const tauriFullscreen: FullscreenPort = {
  isFullscreen: () => getCurrentWindow().isFullscreen(),
  async toggle() {
    const win = getCurrentWindow();
    await win.setFullscreen(!(await win.isFullscreen()));
  },
};
