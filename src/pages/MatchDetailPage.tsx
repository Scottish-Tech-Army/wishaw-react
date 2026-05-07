import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Loading, StatusBadge } from '../components/ui';
import type { Match } from '../types';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) api.getMatch(id).then((m) => setMatch(m ?? null)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <Loading />;
  if (!match) return <div className="text-center py-20 text-surface-400">Match not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header">{match.roundLabel}</h1>
        <StatusBadge status={match.status} />
      </div>
      <div className="card">
        <p className="text-surface-400 mb-4">{new Date(match.scheduledAt).toLocaleString()} · {match.venue}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {match.participants.map((p) => (
            <div key={p.userId} className="bg-surface-700/50 rounded-xl p-4 text-center">
              <p className="font-semibold text-white text-lg">{p.displayName}</p>
              {p.attendance && <p className="text-xs text-surface-400 mt-1">{p.attendance}</p>}
            </div>
          ))}
        </div>
        {match.score && (
          <div className="mt-6 text-center">
            <p className="text-sm text-surface-400">Score</p>
            <p className="text-2xl font-bold text-white">{match.score.summary || JSON.stringify(match.score.fields)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
