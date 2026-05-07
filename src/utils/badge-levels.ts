import type { BadgeLevel } from '../types';

const LEVELS: { threshold: number; label: BadgeLevel }[] = [
  { threshold: 121, label: 'Platinum' },
  { threshold: 71, label: 'Gold' },
  { threshold: 31, label: 'Silver' },
  { threshold: 1, label: 'Bronze' },
];

export function getBadgeLevel(points: number): BadgeLevel {
  for (const { threshold, label } of LEVELS) {
    if (points >= threshold) return label;
  }
  return 'None';
}

export const BADGE_LEVEL_COLORS: Record<BadgeLevel, string> = {
  None: 'text-surface-400 bg-surface-700',
  Bronze: 'text-orange-300 bg-orange-900/30',
  Silver: 'text-gray-200 bg-gray-600/30',
  Gold: 'text-yellow-300 bg-yellow-900/30',
  Platinum: 'text-cyan-200 bg-cyan-900/30',
};
