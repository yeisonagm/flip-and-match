import logo from "@/assets/logo.png";
import { LEVEL_IDS, LEVELS } from "@/features/memory-game";
import { fullscreen } from "@/platform/fullscreen";
import { useInstallPrompt } from "@/platform/pwa";
import { copy } from "@/shared/copy/es";
import type { Screen } from "../types";

interface MenuScreenProps {
  readonly onNavigate: (screen: Screen) => void;
}

export function MenuScreen({ onNavigate }: MenuScreenProps) {
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <main className="menu-screen">
      {canInstall && (
        <button type="button" className="install-banner" onClick={promptInstall}>
          <span className="install-banner-icon" aria-hidden="true">
            ⬇️
          </span>
          {copy.menu.install}
        </button>
      )}
      <img className="menu-badge" src={logo} alt="" />
      <h1 className="menu-title">{copy.menu.title}</h1>
      <p className="menu-subtitle">{copy.menu.subtitle}</p>
      <div className="menu-levels">
        {LEVEL_IDS.map((id, index) => (
          <button
            key={id}
            type="button"
            className="level-btn"
            data-level={id}
            aria-label={copy.menu.play(LEVELS[id].label)}
            onClick={() => onNavigate({ kind: "GAME", levelId: id })}
          >
            <span className="level-btn-stars" aria-hidden="true">
              {"★".repeat(index + 1)}
            </span>
            <span className="level-btn-label">{LEVELS[id].label}</span>
            <span className="level-btn-meta">{copy.menu.pairsLabel(LEVELS[id].pairs)}</span>
          </button>
        ))}
      </div>
      <div className="menu-secondary-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => onNavigate({ kind: "SCORES" })}
        >
          🏆 {copy.menu.scores}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => fullscreen.toggle()}>
          ⛶ {copy.menu.fullscreen}
        </button>
      </div>
    </main>
  );
}
