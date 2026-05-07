import { useState } from 'react';
import ProgressBar from './ProgressBar';

const BADGE_ICONS = {
  'Game Mastery': '🎮',
  'Teamwork': '🤝',
  'Esports Citizen': '🌐',
  'Personal Development': '🌟',
  'Digital Skills': '💻',
};

const LEVEL_THRESHOLDS = { BRONZE: 30, SILVER: 70, GOLD: 120, PLATINUM: 999 };

export default function BadgeCard({ badge }) {
  const { badgeName, totalPoints, level, earnedSubBadges } = badge;
  const icon = BADGE_ICONS[badgeName] || '🏅';
  const nextThreshold = LEVEL_THRESHOLDS[level] || 30;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="badge-card" data-level={level}>
      <div className="badge-card__header">
        <div className="badge-icon">{icon}</div>
        <div className="badge-card__meta">
          <div className="badge-name">{badgeName}</div>
          <span className={`level-tag ${level}`}>{level}</span>
        </div>
      </div>
      <div className="badge-xp">{totalPoints} XP</div>
      <div className="tooltip-wrapper badge-card__progress">
        <ProgressBar value={totalPoints} max={nextThreshold} level={level} />
        <span className="tooltip">
          {totalPoints} / {nextThreshold} XP — Next: {level === 'BRONZE' ? 'Silver' : level === 'SILVER' ? 'Gold' : level === 'GOLD' ? 'Platinum' : 'Max Level'}
        </span>
      </div>

      {earnedSubBadges && earnedSubBadges.length > 0 && (
        <div className="badge-card__earned">
          <button
            className="btn btn-outline btn-sm badge-card__toggle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▲ Hide' : '▼ Show'} Earned ({earnedSubBadges.length})
          </button>
          {expanded && (
            <div className="badge-card__earned-list">
              {earnedSubBadges.map((sb) => (
                <div key={sb.id} className="badge-card__earned-item">
                  <span>✅ {sb.name}</span>
                  <span className="badge-card__earned-points">{sb.points} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {earnedSubBadges && earnedSubBadges.length === 0 && (
        <div className="badge-card__empty">No challenges earned yet</div>
      )}
    </div>
  );
}
