import { useEffect, useState } from "react";
import { fullscreen } from "@/platform/fullscreen";
import { GameScreen } from "./screens/GameScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { ScoresScreen } from "./screens/ScoresScreen";
import type { Screen } from "./types";

// No router: three screens don't justify one, and a switch behaves identically in the
// browser and inside the Tauri WebView.
function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "MENU" });

  useEffect(() => {
    // Tauri's WebView has no browser chrome, so F11 does nothing by default — it has to
    // be captured by hand. The on-screen button (MenuScreen) is the primary way in, since
    // a wall-mounted whiteboard rarely has a keyboard; F11 is a bonus for anyone who does.
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "F11") return;
      event.preventDefault();
      fullscreen.toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  switch (screen.kind) {
    case "MENU":
      return <MenuScreen onNavigate={setScreen} />;
    case "GAME":
      return <GameScreen levelId={screen.levelId} onNavigate={setScreen} />;
    case "SCORES":
      return <ScoresScreen onNavigate={setScreen} />;
  }
}

export default App;
