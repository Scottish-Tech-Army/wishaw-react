import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';
import api from '../services/api';
import { Loading } from '../components/ui';
import type { PlayerStats } from '../types';

export default function StatsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) api.getPlayerStats(user.id).then(setStats).finally(() => setLoading(false)); }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="page-header">My Stats</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><div className="stat-value">{stats?.tournamentsJoined ?? 0}</div><div className="stat-label">Tournaments</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.matchesPlayed ?? 0}</div><div className="stat-label">Matches</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.wins ?? 0}</div><div className="stat-label">Wins</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.attendanceRate ?? 0}%</div><div className="stat-label">Attendance</div></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-2xl font-bold text-green-400">{stats?.wins ?? 0}</p><p className="text-sm text-surface-400">Wins</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-yellow-400">{stats?.draws ?? 0}</p><p className="text-sm text-surface-400">Draws</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-red-400">{stats?.losses ?? 0}</p><p className="text-sm text-surface-400">Losses</p></div>
      </div>
      {stats?.badges && stats.badges.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Badges Earned</h2>
          <div className="flex flex-wrap gap-3">
            {stats.badges.map((b) => (
              <div key={b.id} className="bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-xl">{b.icon}</span><span className="text-sm text-white">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
