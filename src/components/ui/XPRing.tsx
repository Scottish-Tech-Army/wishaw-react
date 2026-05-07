/**
 * XPRing.tsx
 *
 * Circular SVG progress ring that shows:
 *   - Current XP / XP needed for next tier
 *   - Tier label centred inside the ring
 *   - Ring colour matching the current tier
 */

import type { TierThreshold } from '../../types';

interface Props {
  readonly xp: number;
  readonly thresholds: TierThreshold[];
  /** Optional override label (e.g. "LEVEL 4") */
  readonly label?: string;
  /** Diameter in px, default 180 */
  readonly size?: number;
  /** Stroke width, default 10 */
  readonly strokeWidth?: number;
}

function getCurrentThreshold(xp: number, thresholds: TierThreshold[]): TierThreshold {
  const sorted = [...thresholds].sort((a, b) => b.minXP - a.minXP);
  return sorted.find((t) => xp >= t.minXP) ?? thresholds[0];
}

function getNextThreshold(xp: number, thresholds: TierThreshold[]): TierThreshold | null {
  const sorted = [...thresholds].sort((a, b) => a.minXP - b.minXP);
  return sorted.find((t) => t.minXP > xp) ?? null;
}

export default function XPRing({
  xp,
  thresholds,
  label,
  size = 180,
  strokeWidth = 10,
}: Props) {
  const current = getCurrentThreshold(xp, thresholds);
  const next = getNextThreshold(xp, thresholds);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = next
    ? Math.min((xp - current.minXP) / (next.minXP - current.minXP), 1)
    : 1;
  const offset = circumference * (1 - progress);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="xp-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="xp-ring__svg">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={current.colour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="xp-ring__arc"
        />
      </svg>
      <div className="xp-ring__inner">
        <span className="xp-ring__label">{label ?? current.tier.toUpperCase()}</span>
        <span className="xp-ring__xp">{xp} XP</span>
        {next && (
          <span className="xp-ring__next">/ {next.minXP}</span>
        )}
      </div>
    </div>
  );
}
