import type { ReactNode } from "react";

interface StatPillProps {
  /** Tint of the icon chip — purely decorative, one per stat so they read apart at a glance. */
  readonly tone: "gold" | "mint" | "peach" | "rose";
  readonly icon: string;
  readonly label: string;
  readonly children: ReactNode;
}

// The reference UI shows icons only, no visible labels. The label still has to reach a
// screen reader, so it ships as visually-hidden text instead of an aria-label: a live
// clock inside an aria-label would be re-announced on every tick.
export function StatPill({ tone, icon, label, children }: StatPillProps) {
  return (
    <div className="stat-pill" data-tone={tone}>
      <span className="stat-pill-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="stat-pill-value">
        <span className="visually-hidden">{label}: </span>
        {children}
      </span>
    </div>
  );
}
