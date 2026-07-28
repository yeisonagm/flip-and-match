import type { ScoreEntry } from "../domain/types";

// Two columns of ten, not one column of twenty: twenty rows don't fit next to the
// header and tabs without scrolling (IMPLEMENTATION_PLAN.md §13), and it reads better on
// a wide screen besides.
export function LeaderboardTable({ entries }: { readonly entries: readonly ScoreEntry[] }) {
  return (
    <div className="leaderboard-columns">
      <ScoreColumn entries={entries.slice(0, 10)} startRank={1} />
      <ScoreColumn entries={entries.slice(10, 20)} startRank={11} />
    </div>
  );
}

function ScoreColumn({
  entries,
  startRank,
}: {
  readonly entries: readonly ScoreEntry[];
  readonly startRank: number;
}) {
  return (
    <ol className="leaderboard-column" start={startRank}>
      {entries.map((entry) => (
        <li key={entry.id} className="leaderboard-row">
          <span className="leaderboard-name">{entry.playerName}</span>
          <span className="leaderboard-score">{entry.score}</span>
        </li>
      ))}
    </ol>
  );
}
