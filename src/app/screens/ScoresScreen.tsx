import { copy } from "@/shared/copy/es";
import type { Screen } from "../types";

interface ScoresScreenProps {
  readonly onNavigate: (screen: Screen) => void;
}

export function ScoresScreen({ onNavigate }: ScoresScreenProps) {
  return (
    <main className="scores-screen">
      <h1>{copy.scores.title}</h1>
      <p>{copy.scores.comingSoon}</p>
      <button type="button" className="btn" onClick={() => onNavigate({ kind: "MENU" })}>
        {copy.scores.back}
      </button>
    </main>
  );
}
