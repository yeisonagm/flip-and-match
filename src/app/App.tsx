import { useState } from "react";
import { GameScreen } from "./screens/GameScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { ScoresScreen } from "./screens/ScoresScreen";
import type { Screen } from "./types";

// No router: three screens don't justify one, and a switch behaves identically in the
// browser and inside the Tauri WebView.
function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "MENU" });

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
