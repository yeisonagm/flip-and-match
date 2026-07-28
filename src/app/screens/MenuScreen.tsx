import { LEVEL_IDS, LEVELS } from "@/features/memory-game";
import { fullscreen } from "@/platform/fullscreen";
import { copy } from "@/shared/copy/es";
import type { Screen } from "../types";

interface MenuScreenProps {
  readonly onNavigate: (screen: Screen) => void;
}

export function MenuScreen({ onNavigate }: MenuScreenProps) {
  return (
    <main className="menu-screen">
      <h1>{copy.menu.title}</h1>
      <p>{copy.menu.subtitle}</p>
      <div className="menu-levels">
        {LEVEL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="btn"
            onClick={() => onNavigate({ kind: "GAME", levelId: id })}
          >
            {copy.menu.play(LEVELS[id].label)}
          </button>
        ))}
      </div>
      <div className="menu-levels">
        <button type="button" className="btn" onClick={() => onNavigate({ kind: "SCORES" })}>
          {copy.menu.scores}
        </button>
        <button type="button" className="btn" onClick={() => fullscreen.toggle()}>
          {copy.menu.fullscreen}
        </button>
      </div>
    </main>
  );
}
