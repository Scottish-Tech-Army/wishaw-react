/**
 * Home.tsx – User Dashboard
 *
 * Main landing page for logged-in users showing:
 *   - Welcome message with tier
 *   - Total XP ring
 *   - Badge progress cards
 *   - Recent activity feed
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Award, Activity as ActivityIcon, AlertCircle, ChevronRight } from 'lucide-react';
import PageShell from '../../components/ui/PageShell';
import XPRing from '../../components/ui/XPRing';
import BadgeCard from '../../components/ui/BadgeCard';
import ActivityItem from '../../components/ui/ActivityItem';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import type { Badge, UserBadgeProgress, Activity, TierThreshold } from '../../types';

/** Get the full TierThreshold for a given XP */
function getTierThreshold(xp: number, thresholds: TierThreshold[]): TierThreshold {
  const sorted = [...thresholds].sort((a, b) => b.minXP - a.minXP);
  return sorted.find((t) => xp >= t.minXP) ?? thresholds[0];
}

/** Get badge progress for a specific user and badge */
function findBadgeProgress(
  progress: UserBadgeProgress[],
  userId: string,
  badge: Badge
): UserBadgeProgress | undefined {
  return progress.find(
    (p) => p.userId === userId && p.badgeCategory === badge.category
  );
}

/** Get recent activities for a user, sorted newest first */
function getRecentActivities(
  activities: Activity[],
  userId: string,
  limit: number
): Activity[] {
  return activities
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/** Count completed badges (max tier reached) */
function countCompletedBadges(
  progress: UserBadgeProgress[],
  userId: string,
  maxTierXP: number
): number {
  return progress.filter(
    (p) => p.userId === userId && p.totalXP >= maxTierXP
  ).length;
}

export default function Home() {
  const { currentUser } = useAuth();
  const { state, getTotalXP } = useData();
  const navigate = useNavigate();

  // Compute derived data
  const totalXP = useMemo(
    () => (currentUser ? getTotalXP(currentUser.id) : 0),
    [currentUser, getTotalXP]
  );

  const currentTier = useMemo(
    () => getTierThreshold(totalXP, state.tierThresholds),
    [totalXP, state.tierThresholds]
  );

  const recentActivities = useMemo(
    () => (currentUser ? getRecentActivities(state.activities, currentUser.id, 5) : []),
    [currentUser, state.activities]
  );

  // Activities with evidence requested
  const evidenceRequestedActivities = useMemo(
    () =>
      currentUser
        ? state.activities.filter(
            (a) =>
              a.userId === currentUser.id &&
              a.status === 'pending' &&
              a.evidenceRequested &&
              !a.evidenceUrl
          )
        : [],
    [currentUser, state.activities]
  );

  // Stats
  const maxTierXP = Math.max(...state.tierThresholds.map((t) => t.minXP));
  const completedBadges = currentUser
    ? countCompletedBadges(state.userBadgeProgress, currentUser.id, maxTierXP)
    : 0;
  const modulesInProgress = currentUser
    ? state.moduleProgress.filter(
        (mp) => mp.userId === currentUser.id && !mp.completedAt
      ).length
    : 0;

  if (!currentUser) {
    return (
      <PageShell title="Dashboard">
        <div className="page-spinner">
          <div className="spinner" />
          <span className="page-spinner-text">Loading...</span>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Dashboard">
      <div className="home animate-fade-in">
        {/* ── Evidence Requested Alert ──────────────────────────────── */}
        {evidenceRequestedActivities.length > 0 && (
          <section className="home__alert home__alert--warning animate-fade-in-down">
            <div className="home__alert-icon">
              <AlertCircle size={24} />
            </div>
            <div className="home__alert-content">
              <h3 className="home__alert-title">Evidence Requested</h3>
              <p className="home__alert-text">
                {evidenceRequestedActivities.length === 1
                  ? 'An admin has requested evidence for one of your submissions.'
                  : `An admin has requested evidence for ${evidenceRequestedActivities.length} of your submissions.`}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-warning btn-sm home__alert-action"
              onClick={() => {
                // Navigate to modules page with the first evidence-requested activity's module
                const firstActivity = evidenceRequestedActivities[0];
                const moduleId = firstActivity?.moduleId;
                navigate(moduleId ? `/modules?expand=${moduleId}` : '/modules');
              }}
            >
              Add Evidence
              <ChevronRight size={16} />
            </button>
          </section>
        )}

        {/* ── Welcome Section ───────────────────────────────────────── */}
        <section className="home__welcome">
          <div className="home__welcome-text">
            <h2 className="home__greeting">
              Welcome back, <span className="text-accent">{currentUser.displayName.split(' ')[0]}</span>!
            </h2>
            <p className="home__subtitle text-muted">
              Keep up the great work. Here's your progress overview.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="home__stats">
            <div className="home__stat">
              <div className="home__stat-icon" style={{ color: currentTier.colour }}>
                <Trophy size={20} />
              </div>
              <div className="home__stat-content">
                <span className="home__stat-value" style={{ color: currentTier.colour }}>
                  {currentTier.tier}
                </span>
                <span className="home__stat-label">Current Tier</span>
              </div>
            </div>
            <div className="home__stat">
              <div className="home__stat-icon text-accent">
                <Award size={20} />
              </div>
              <div className="home__stat-content">
                <span className="home__stat-value">{completedBadges}/5</span>
                <span className="home__stat-label">Badges Maxed</span>
              </div>
            </div>
            <div className="home__stat">
              <div className="home__stat-icon text-warning">
                <TrendingUp size={20} />
              </div>
              <div className="home__stat-content">
                <span className="home__stat-value">{modulesInProgress}</span>
                <span className="home__stat-label">Modules Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── XP Ring Section ───────────────────────────────────────── */}
        <section className="home__xp-section">
          <div className="home__xp-ring">
            <XPRing
              xp={totalXP}
              thresholds={state.tierThresholds}
              size={200}
              strokeWidth={12}
            />
          </div>
          <div className="home__xp-info">
            <span className="home__xp-total font-display">{totalXP.toLocaleString()}</span>
            <span className="home__xp-label text-muted">Total XP Earned</span>
          </div>
        </section>

        {/* ── Badge Progress Section ────────────────────────────────── */}
        <section className="home__badges-section">
          <div className="home__section-header">
            <h3 className="home__section-title">
              <Award size={20} />
              Badge Progress
            </h3>
          </div>
          <div className="home__badges-grid">
            {state.badges.map((badge) => {
              const progress = findBadgeProgress(
                state.userBadgeProgress,
                currentUser.id,
                badge
              );
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  progress={progress}
                  thresholds={state.tierThresholds}
                  locked={!progress}
                />
              );
            })}
          </div>
        </section>

        {/* ── Recent Activity Section ───────────────────────────────── */}
        <section className="home__activity-section">
          <div className="home__section-header">
            <h3 className="home__section-title">
              <ActivityIcon size={20} />
              Recent Activity
            </h3>
          </div>
          {recentActivities.length > 0 ? (
            <div className="home__activity-list">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ActivityItem activity={activity} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ActivityIcon size={48} className="empty-state-icon" />
              <p className="empty-state-title">No activity yet</p>
              <p className="empty-state-description">
                Complete modules and earn XP to see your activity here.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
