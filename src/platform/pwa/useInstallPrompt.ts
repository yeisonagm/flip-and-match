import { useEffect, useState } from "react";

// Not in any lib.dom.d.ts yet — Chromium-only, still in the WHATWG "living" proposal
// stage.
interface BeforeInstallPromptEvent extends Event {
  readonly prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isTauri = "__TAURI_INTERNALS__" in window;

// display-mode: standalone covers Chromium/Edge once installed; iOS Safari never fires
// beforeinstallprompt or exposes display-mode at all — `navigator.standalone` is the only
// signal it gives for "already added to the home screen".
const isStandalone = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as { standalone?: boolean }).standalone === true;

interface InstallPrompt {
  readonly canInstall: boolean;
  readonly promptInstall: () => Promise<void>;
}

// Tauri is already an installed desktop app — this hook stays inert there, same
// environment-detection pattern platform/fullscreen and registerPwa use.
export function useInstallPrompt(): InstallPrompt {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isTauri || isStandalone());

  useEffect(() => {
    if (isTauri) return;
    const onBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault(); // suppress the browser's own mini-infobar; we show our own button instead
      setDeferredEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = (): void => {
      setInstalled(true);
      setDeferredEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<void> => {
    if (deferredEvent === null) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  };

  return { canInstall: !installed && deferredEvent !== null, promptInstall };
}
