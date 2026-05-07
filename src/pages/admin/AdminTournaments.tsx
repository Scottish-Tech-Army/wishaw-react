import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loading, StatusBadge } from '../../components/ui';
import { Trophy } from 'lucide-react';
import type { Tournament } from '../../types';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getTournaments().then((d) => setTournaments(d.tournaments)).finally(() => setLoading(false)); }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Tournament Management</h1>
        <Link to="/admin/tournaments/create" className="btn-primary">+ Create</Link>
      </div>
      <div className="space-y-3">
        {tournaments.map((t) => (
          <div key={t.id} className="card flex items-center justify-between">
            <div><h3 className="font-semibold text-white">{t.name}</h3><p className="text-sm text-surface-400">{t.venue}</p></div>
            <div className="flex items-center gap-3">
              <StatusBadge status={t.status} />
              <Link to={`/admin/tournaments/${t.id}`} className="btn-secondary btn-sm">View</Link>
            </div>
          </div>
        ))}
        {tournaments.length === 0 && <div className="text-center py-16"><Trophy className="w-12 h-12 text-surface-500 mx-auto mb-3" /><p className="text-surface-400">No tournaments yet.</p></div>}
      </div>
    </div>
  );
}
