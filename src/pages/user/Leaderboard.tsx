/**
 * Leaderboard.tsx – Rankings Page
 *
 * Displays:
 *   - Tab navigation: Global | Per-Centre | Per-Badge
 *   - Ranked list of users by XP
 *   - Current user highlighted
 *   - Top 3 with special styling (gold, silver, bronze)
 */

import { useState, useMemo } from 'react';
import { Trophy, Medal, Crown, MapPin, Award } from 'lucide-react';
import PageShell from '../../components/ui/PageShell';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import type { User, BadgeCategory, TierThreshold } from '../../types';

type TabType = 'global' | 'centre' | 'badge';

interface RankedUser {
  user: User;
  xp: number;
  rank: number;
}

/** Get tier threshold for XP */
function getTierThreshold(xp: number, thresholds: TierThreshold[]): TierThreshold {
  const sorted = [...thresholds].sort((a, b) => b.minXP - a.minXP);
  return sorted.find((t) => xp >= t.minXP) ?? thresholds[0];
}

/** Get initials from name */
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const { state, getTotalXP, getBadgeProgress } = useData();

  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [selectedCentre, setSelectedCentre] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<BadgeCategory>('Game Mastery');

  // Get all active users (not admins/superadmins for user leaderboard)
  const activeUsers = useMemo(
    () => state.users.filter((u) => u.isActive && u.role === 'user'),
    [state.users]
  );

  // Global leaderboard - all users by total XP
  const globalRankings = useMemo((): RankedUser[] => {
    const ranked = activeUsers
      .map((user) => ({
        user,
        xp: getTotalXP(user.id),
        rank: 0,
      }))
      .sort((a, b) => b.xp - a.xp);

    return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [activeUsers, getTotalXP]);

  // Centre leaderboard - users from selected centre (or user's centre by default)
  const centreRankings = useMemo((): RankedUser[] => {
    const effectiveCentreId = selectedCentre || currentUser?.centreId || '';
    const centreUsers = activeUsers.filter((u) => u.centreId === effectiveCentreId);

    const ranked = centreUsers
      .map((user) => ({
        user,
        xp: getTotalXP(user.id),
        rank: 0,
      }))
      .sort((a, b) => b.xp - a.xp);

    return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [activeUsers, selectedCentre, currentUser, getTotalXP]);

  // Badge leaderboard - users by specific badge category XP
  const badgeRankings = useMemo((): RankedUser[] => {
    const ranked = activeUsers
      .map((user) => {
        const progress = getBadgeProgress(user.id, selectedBadge);
        return {
          user,
          xp: progress?.totalXP ?? 0,
          rank: 0,
        };
      })
      .filter((item) => item.xp > 0) // Only show users with XP in this badge
      .sort((a, b) => b.xp - a.xp);

    return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [activeUsers, selectedBadge, getBadgeProgress]);

  // Current rankings based on active tab
  const currentRankings = useMemo(() => {
    if (activeTab === 'global') return globalRankings;
    if (activeTab === 'centre') return centreRankings;
    return badgeRankings;
  }, [activeTab, globalRankings, centreRankings, badgeRankings]);

  // Find current user's rank
  const currentUserRank = useMemo(() => {
    if (!currentUser) return null;
    return currentRankings.find((r) => r.user.id === currentUser.id) ?? null;
  }, [currentRankings, currentUser]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'global', label: 'Global', icon: <Trophy size={16} /> },
    { id: 'centre', label: 'Centre', icon: <MapPin size={16} /> },
    { id: 'badge', label: 'By Badge', icon: <Award size={16} /> },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="leaderboard__rank-icon--gold" />;
    if (rank === 2) return <Medal size={20} className="leaderboard__rank-icon--silver" />;
    if (rank === 3) return <Medal size={20} className="leaderboard__rank-icon--bronze" />;
    return null;
  };

  const getRankClass = (rank: number): string => {
    if (rank === 1) return 'leaderboard__row--gold';
    if (rank === 2) return 'leaderboard__row--silver';
    if (rank === 3) return 'leaderboard__row--bronze';
    return '';
  };

  if (!currentUser) {
    return (
      <PageShell title="Leaderboard">
        <div className="page-spinner">
          <div className="spinner" />
          <span className="page-spinner-text">Loading...</span>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Leaderboard">
      <div className="leaderboard animate-fade-in">
        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="leaderboard__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`leaderboard__tab ${activeTab === tab.id ? 'leaderboard__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Filters ───────────────────────────────────────────────── */}
        {activeTab === 'centre' && (
          <div className="leaderboard__filter">
            <label className="label" htmlFor="centre-select">
              Select Centre
            </label>
            <select
              id="centre-select"
              className="select"
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
            >
              {state.centres.map((centre) => (
                <option key={centre.id} value={centre.id}>
                  {centre.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'badge' && (
          <div className="leaderboard__filter">
            <label className="label" htmlFor="badge-select">
              Select Badge Category
            </label>
            <select
              id="badge-select"
              className="select"
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value as BadgeCategory)}
            >
              {state.badges.map((badge) => (
                <option key={badge.id} value={badge.category}>
                  {badge.category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Current User Position ─────────────────────────────────── */}
        {currentUserRank && (
          <div className="leaderboard__your-rank">
            <span className="leaderboard__your-rank-label">Your Position</span>
            <div className="leaderboard__your-rank-card">
              <span className="leaderboard__your-rank-number">#{currentUserRank.rank}</span>
              <span className="leaderboard__your-rank-xp">
                {currentUserRank.xp.toLocaleString()} XP
              </span>
            </div>
          </div>
        )}

        {/* ── Rankings List ─────────────────────────────────────────── */}
        <div className="leaderboard__list">
          {currentRankings.length > 0 ? (
            currentRankings.map((item, index) => {
              const tier = getTierThreshold(item.xp, state.tierThresholds);
              const isCurrentUser = item.user.id === currentUser.id;

              return (
                <div
                  key={item.user.id}
                  className={`leaderboard__row ${getRankClass(item.rank)} ${
                    isCurrentUser ? 'leaderboard__row--current' : ''
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Rank */}
                  <div className="leaderboard__rank">
                    {getRankIcon(item.rank) || (
                      <span className="leaderboard__rank-number">{item.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="leaderboard__avatar">
                    {item.user.avatarUrl ? (
                      <img src={item.user.avatarUrl} alt={item.user.displayName} />
                    ) : (
                      <span>{getInitials(item.user.displayName)}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="leaderboard__user-info">
                    <span className="leaderboard__name">
                      {item.user.displayName}
                      {isCurrentUser && <span className="leaderboard__you-badge">You</span>}
                    </span>
                    <span
                      className="leaderboard__tier"
                      style={{ color: tier.colour }}
                    >
                      {tier.tier}
                    </span>
                  </div>

                  {/* XP */}
                  <div className="leaderboard__xp">
                    <span className="leaderboard__xp-value">
                      {item.xp.toLocaleString()}
                    </span>
                    <span className="leaderboard__xp-label">XP</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <Trophy size={48} className="empty-state-icon" />
              <p className="empty-state-title">No rankings yet</p>
              <p className="empty-state-description">
                {activeTab === 'badge'
                  ? 'No one has earned XP in this badge category yet.'
                  : 'Be the first to earn XP and appear on the leaderboard!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
