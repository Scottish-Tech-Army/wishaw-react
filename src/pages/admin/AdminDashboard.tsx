import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loading } from '../../components/ui';
import { Trophy, Swords, Award, BookOpen, Users } from 'lucide-react';
import type { AdminDashboard as AdminDashboardData } from '../../types';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getAdminDashboard().then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="page-header">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><div className="stat-value">{data?.totalTournaments ?? 0}</div><div className="stat-label">Tournaments</div></div>
        <div className="stat-card"><div className="stat-value">{data?.activeTournaments ?? 0}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value">{data?.totalPlayers ?? 0}</div><div className="stat-label">Players</div></div>
        <div className="stat-card"><div className="stat-value">{data?.totalMatches ?? 0}</div><div className="stat-label">Matches</div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/tournaments/create" className="card-hover flex items-center gap-4"><Trophy className="w-8 h-8 text-primary-400" /><div><h3 className="font-semibold text-white">Create Tournament</h3><p className="text-sm text-surface-400">Set up a new competition</p></div></Link>
        <Link to="/admin/sports" className="card-hover flex items-center gap-4"><Swords className="w-8 h-8 text-green-400" /><div><h3 className="font-semibold text-white">Manage Sports</h3><p className="text-sm text-surface-400">Add or edit sport types</p></div></Link>
        <Link to="/admin/badges" className="card-hover flex items-center gap-4"><Award className="w-8 h-8 text-yellow-400" /><div><h3 className="font-semibold text-white">Manage Badges</h3><p className="text-sm text-surface-400">Configure badge system</p></div></Link>
      </div>

      {data?.topPerformers && data.topPerformers.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-3">Top Performers</h2>
          <div className="space-y-2">
            {data.topPerformers.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-surface-700/50 rounded-lg px-4 py-2">
                <span className="text-white">{p.displayName}</span><span className="text-primary-400 font-medium">{p.wins} wins</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
