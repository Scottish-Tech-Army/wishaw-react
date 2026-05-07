import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loading } from '../components/ui';
import { getBadgeLevel, BADGE_LEVEL_COLORS } from '../utils/badge-levels';
import { useAuthStore } from '../store/auth-store';
import type { MainBadge, SubBadge, UserBadgeProgress } from '../types';

export default function BadgesPage() {
  const { user } = useAuthStore();
  const [mainBadges, setMainBadges] = useState<MainBadge[]>([]);
  const [subBadges, setSubBadges] = useState<SubBadge[]>([]);
  const [progress, setProgress] = useState<UserBadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [mb, sb, bp] = await Promise.all([
          api.getMainBadges(),
          api.getSubBadges(),
          user ? api.getUserBadgeProgress(user.id) : Promise.resolve([]),
        ]);
        setMainBadges(mb);
        setSubBadges(sb);
        setProgress(bp);
      } finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-header">Badges</h1>
        <p className="text-surface-400">Track your progress across the 5 main badges. Earn XP by completing sub-badges in modules.</p>
        <p className="text-xs text-surface-500 mt-1">Bronze: 0-30 · Silver: 31-70 · Gold: 71-120 · Platinum: 120+</p>
      </div>

      {/* Main Badge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainBadges.map((mb) => {
          const bp = progress.find((p) => p.mainBadgeId === mb.id);
          const pts = bp?.totalPoints ?? 0;
          const level = getBadgeLevel(pts);
          const earned = bp?.earnedSubBadges ?? [];
          const moduleSubs = subBadges.filter((s) => s.mainBadgeId === mb.id);

          return (
            <div key={mb.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{mb.icon}</span>
                <div>
                  <h2 className="font-semibold text-white">{mb.name}</h2>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${BADGE_LEVEL_COLORS[level]}`}>{level} — {pts} pts</span>
                </div>
              </div>
              <p className="text-sm text-surface-400 mb-4">{mb.description}</p>

              {/* Progress bar */}
              <div className="w-full bg-surface-700 rounded-full h-2 mb-4">
                <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (pts / 120) * 100)}%` }} />
              </div>

              {/* Sub-badges */}
              <div className="space-y-2">
                {moduleSubs.map((sb) => (
                  <div key={sb.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${earned.includes(sb.id) ? 'bg-green-900/20 border border-green-500/20' : 'bg-surface-700/50'}`}>
                    <span className={earned.includes(sb.id) ? 'text-green-300' : 'text-surface-300'}>{earned.includes(sb.id) ? '✓ ' : ''}{sb.name}</span>
                    <span className="text-xs text-surface-400">{sb.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
