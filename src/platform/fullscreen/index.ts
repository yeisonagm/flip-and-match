import { tauriFullscreen } from "./tauriFullscreen";
import { webFullscreen } from "./webFullscreen";

export type { FullscreenPort } from "./FullscreenPort";

const isTauri = "__TAURI_INTERNALS__" in window;

export const fullscreen = isTauri ? tauriFullscreen : webFullscreen;
