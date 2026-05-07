/**
 * BadgeCard.tsx
 *
 * Displays one of the 5 core badges with:
 *   - Hexagon SVG clip-path shape
 *   - Badge name + category
 *   - Current tier label (coloured)
 *   - XP progress bar toward next tier
 */

import type { Badge, UserBadgeProgress, TierThreshold } from '../../types';

interface Props {
  readonly badge: Badge;
  /** Progress record for this user+badge, or undefined if no XP yet */
  readonly progress: UserBadgeProgress | undefined;
  readonly thresholds: TierThreshold[];
  /** 'md' (default) | 'sm' for compact grid view */
  readonly size?: 'sm' | 'md';
  /** If true, renders as locked/greyed */
  readonly locked?: boolean;
}

function getNextThreshold(xp: number, thresholds: TierThreshold[]) {
  const sorted = [...thresholds].sort((a, b) => a.minXP - b.minXP);
  return sorted.find((t) => t.minXP > xp) ?? null;
}

function getCurrentThreshold(xp: number, thresholds: TierThreshold[]) {
  const sorted = [...thresholds].sort((a, b) => b.minXP - a.minXP);
  return sorted.find((t) => xp >= t.minXP) ?? thresholds[0];
}

const BADGE_ICONS: Record<string, string> = {
  'Game Mastery':        '🎮',
  'Teamwork':            '🤝',
  'Esports Citizen':     '🛡️',
  'Personal Development':'⭐',
  'Digital Skills':      '💻',
};

export default function BadgeCard({ badge, progress, thresholds, size = 'md', locked = false }: Props) {
  const xp = progress?.totalXP ?? 0;
  const current = getCurrentThreshold(xp, thresholds);
  const next = getNextThreshold(xp, thresholds);
  const pct = next
    ? Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100)
    : 100;
  const icon = BADGE_ICONS[badge.category] ?? '🏅';

  return (
    <div className={`badge-card badge-card--${size} ${locked ? 'badge-card--locked' : ''}`}>
      {/* Hexagon icon area */}
      <div className="badge-card__hex" style={{ '--tier-colour': locked ? 'var(--color-border)' : current.colour } as React.CSSProperties}>
        <span className="badge-card__icon" role="img" aria-label={badge.name}>
          {locked ? '🔒' : icon}
        </span>
      </div>

      {/* Info */}
      <div className="badge-card__info">
        <span className="badge-card__name">{badge.name}</span>
        {!locked && (
          <>
            <span
              className="badge-card__tier"
              style={{ color: current.colour }}
            >
              {current.tier}
            </span>
            <div className="badge-card__bar-track">
              <div
                className="badge-card__bar-fill"
                style={{ width: `${pct}%`, backgroundColor: current.colour }}
              />
            </div>
            <span className="badge-card__xp">{xp} XP</span>
          </>
        )}
        {locked && <span className="badge-card__locked-label">Not started</span>}
      </div>
    </div>
  );
}
