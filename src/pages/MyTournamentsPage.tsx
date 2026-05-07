import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import api from '../services/api';
import { Loading, EmptyState } from '../components/ui';
import { Calendar, Trophy } from 'lucide-react';
import type { PlayerStats } from '../types';

export default function MyTournamentsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) api.getPlayerStats(user.id).then(setStats).finally(() => setLoading(false)); }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="page-header">My Tournaments</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><div className="stat-value">{stats?.tournamentsJoined ?? 0}</div><div className="stat-label">Joined</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.activeTournaments ?? 0}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.completedTournaments ?? 0}</div><div className="stat-label">Completed</div></div>
      </div>
      {stats?.tournaments && stats.tournaments.length > 0 ? (
        <div className="space-y-3">
          {stats.tournaments.map((t) => (
            <Link key={t.id} to={`/tournaments/${t.id}`} className="card-hover flex items-center gap-4">
              <Calendar className="w-5 h-5 text-primary-400" />
              <div><h3 className="font-semibold text-white">{t.name}</h3><p className="text-sm text-surface-400">{t.venue}</p></div>
              <span className="ml-auto badge-success">{t.status}</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={Trophy} title="No tournaments yet" description="Browse and join one!" action={<Link to="/tournaments" className="btn-primary">Browse Tournaments</Link>} />
      )}
    </div>
  );
}
