/**
 * ActivityItem.tsx
 *
 * Single row in a recent-activity feed.
 * Shows: type icon | description | badge category chip | XP | date | status badge
 */

import { CheckCircle, Clock, XCircle, Gamepad2, Users, Shield, Star, Monitor, Trophy, Mic, Zap } from 'lucide-react';
import type { Activity } from '../../types';

interface Props {
  readonly activity: Activity;
  /** Show the user's name (admin view); omit for user's own feed */
  readonly showUser?: boolean;
  readonly userName?: string;
}

function typeIcon(type: Activity['type']) {
  switch (type) {
    case 'Sub-Badge Completion':    return <Gamepad2 size={16} />;
    case 'Module Completion':       return <Trophy size={16} />;
    case 'Mini-League Match':       return <Users size={16} />;
    case 'Tournament Match':        return <Trophy size={16} />;
    case 'Podcast / Broadcast':     return <Mic size={16} />;
    case 'Drop-In Session':         return <Zap size={16} />;
    case 'Manual XP Award':         return <Star size={16} />;
    default:                        return <Monitor size={16} />;
  }
}

function categoryIcon(cat: Activity['badgeCategory']) {
  switch (cat) {
    case 'Game Mastery':         return <Gamepad2 size={12} />;
    case 'Teamwork':             return <Users size={12} />;
    case 'Esports Citizen':      return <Shield size={12} />;
    case 'Personal Development': return <Star size={12} />;
    case 'Digital Skills':       return <Monitor size={12} />;
    default:                     return null;
  }
}

function statusIcon(status: Activity['status']) {
  switch (status) {
    case 'approved': return <CheckCircle size={14} className="activity-item__status--approved" />;
    case 'rejected': return <XCircle size={14} className="activity-item__status--rejected" />;
    default:         return <Clock size={14} className="activity-item__status--pending" />;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ActivityItem({ activity, showUser = false, userName }: Props) {
  return (
    <div className={`activity-item activity-item--${activity.status}`}>
      {/* Type icon */}
      <div className="activity-item__type-icon">
        {typeIcon(activity.type)}
      </div>

      {/* Main content */}
      <div className="activity-item__body">
        {showUser && userName && (
          <span className="activity-item__user">{userName}</span>
        )}
        <span className="activity-item__desc">{activity.description}</span>
        <div className="activity-item__meta">
          {/* Category chip */}
          <span className="activity-item__category">
            {categoryIcon(activity.badgeCategory)}
            {activity.badgeCategory}
          </span>
          {/* Date */}
          <span className="activity-item__date">{formatDate(activity.createdAt)}</span>
        </div>
        {/* Rejection reason */}
        {activity.status === 'rejected' && activity.rejectionReason && (
          <span className="activity-item__rejection">
            {activity.rejectionReason}
          </span>
        )}
      </div>

      {/* Right side: XP + status */}
      <div className="activity-item__right">
        <span className="activity-item__xp">+{activity.xpAwarded} XP</span>
        {statusIcon(activity.status)}
      </div>
    </div>
  );
}
