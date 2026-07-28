interface StatTileProps {
  readonly icon: string;
  readonly label: string;
  readonly value: string | number;
}

export function StatTile({ icon, label, value }: StatTileProps) {
  return (
    <div className="stat-tile">
      <span className="stat-tile-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="stat-tile-label">{label}</span>
      <span className="stat-tile-value">{value}</span>
    </div>
  );
}
