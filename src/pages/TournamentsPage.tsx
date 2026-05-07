import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loading, StatusBadge } from '../components/ui';
import { Trophy } from 'lucide-react';
import type { Tournament } from '../types';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getTournaments().then((d) => setTournaments(d.tournaments)).finally(() => setLoading(false)); }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Tournaments</h1><p className="text-surface-400">Browse and join upcoming tournaments</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournaments.map((t) => (
          <Link key={t.id} to={`/tournaments/${t.id}`} className="card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">{t.name}</h3>
              <StatusBadge status={t.status} />
            </div>
            <p className="text-sm text-surface-400 line-clamp-2">{t.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
              <span>📍 {t.venue}</span>
              <span>{t.participantCount}/{t.capacity}</span>
            </div>
          </Link>
        ))}
        {tournaments.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-16 gap-3">
            <Trophy className="w-12 h-12 text-surface-500" />
            <p className="text-surface-400">No tournaments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
