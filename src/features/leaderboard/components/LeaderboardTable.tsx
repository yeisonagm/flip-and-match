import type { ScoreEntry } from "../domain/types";

// A second column only kicks in past 10 entries: twenty rows don't fit next to the
// header and tabs without scrolling (IMPLEMENTATION_PLAN.md §13), and it reads better on
// a wide screen besides. With 10 or fewer, one wider centered column reads as a proper
// podium/list instead of leaving an empty second column dangling next to it.
export function LeaderboardTable({ entries }: { readonly entries: readonly ScoreEntry[] }) {
  if (entries.length <= 10) {
    return (
      <div className="leaderboard-columns" data-single="true">
        <ScoreColumn entries={entries} startRank={1} />
      </div>
    );
  }
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
      {entries.map((entry, index) => (
        <li key={entry.id} className="leaderboard-row" data-rank-tier={rankTier(startRank + index)}>
          <RankBadge rank={startRank + index} />
          <span className="leaderboard-name">{entry.playerName}</span>
          <span className="leaderboard-score">{entry.score}</span>
        </li>
      ))}
    </ol>
  );
}

const rankTier = (rank: number): "gold" | "silver" | "bronze" | "rest" =>
  rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "rest";

// The overall top 3 get a medal (color is the whole point, so the emoji's own colored
// glyph is used rather than fighting it with currentColor like the rest of the icons in
// the app); everyone else gets a plain star — still a rank marker, just a quieter one.
function RankBadge({ rank }: { readonly rank: number }) {
  const tier = rankTier(rank);
  const glyph = tier === "gold" ? "🥇" : tier === "silver" ? "🥈" : tier === "bronze" ? "🥉" : "⭐";
  return (
    <span className="rank-badge" data-tier={tier} aria-hidden="true">
      {glyph}
    </span>
  );
}
