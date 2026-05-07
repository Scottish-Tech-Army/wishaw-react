import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Loading, StatusBadge, Tabs } from '../../components/ui';
import toast from 'react-hot-toast';
import type { Tournament, Participant, Match } from '../../types';
import { formatDateTime } from '../../utils/date-time';

export default function AdminTournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'publish' | 'complete' | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getTournament(id), api.getParticipants(id), api.getMatches(id)]).then(([t, p, m]) => {
      setTournament(t ?? null); setParticipants(p); setMatches(m);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!tournament) return <p className="text-center py-20 text-surface-400">Not found</p>;

  const handlePublish = async () => {
    if (actionLoading || tournament.status !== 'DRAFT') return;
    setActionLoading('publish');
    try {
      const updatedTournament = await api.publishTournament(tournament.id);
      setTournament(updatedTournament);
      toast.success('Published');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    if (actionLoading || tournament.status !== 'PUBLISHED') return;
    setActionLoading('complete');
    try {
      const updatedTournament = await api.completeTournament(tournament.id);
      setTournament(updatedTournament);
      toast.success('Completed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="page-header">{tournament.name}</h1><p className="text-surface-400">{tournament.venue}</p></div>
        <div className="flex items-center gap-3">
          <StatusBadge status={tournament.status} />
          <button className="btn-secondary" onClick={handlePublish} disabled={tournament.status !== 'DRAFT' || actionLoading !== null}>
            {actionLoading === 'publish' ? 'Publishing...' : 'Publish'}
          </button>
          <button className="btn-primary" onClick={handleComplete} disabled={tournament.status !== 'PUBLISHED' || actionLoading !== null}>
            {actionLoading === 'complete' ? 'Completing...' : 'Complete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-500">Tournament starts</p>
          <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(tournament.startDate)}</p>
        </div>
        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-500">Tournament ends</p>
          <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(tournament.endDate)}</p>
        </div>
        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-500">Registration opens</p>
          <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(tournament.regStartDate)}</p>
        </div>
        <div className="rounded-2xl border border-surface-700/60 bg-surface-800/90 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-500">Registration deadline</p>
          <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(tournament.regEndDate)}</p>
        </div>
      </div>

      <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'participants', label: `Participants (${participants.length})` }, { id: 'matches', label: `Matches (${matches.length})` }]} activeTab={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card"><div className="stat-value">{participants.length}</div><div className="stat-label">Participants</div></div>
          <div className="stat-card"><div className="stat-value">{matches.length}</div><div className="stat-label">Matches</div></div>
          <div className="stat-card"><div className="stat-value">{tournament.capacity}</div><div className="stat-label">Capacity</div></div>
          <div className="stat-card"><div className="stat-value">{tournament.type}</div><div className="stat-label">Type</div></div>
          <div className="stat-card">
            <div className="stat-value">
              {tournament.minAge || tournament.maxAge
                ? `${tournament.minAge || '—'}–${tournament.maxAge || '—'}`
                : 'All'}
            </div>
            <div className="stat-label">Age range</div>
          </div>
        </div>
      )}

      {tab === 'participants' && (
        <div className="card"><div className="table-container"><table className="table"><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>
          {participants.map((p) => <tr key={p.id}><td className="text-white">{p.displayName}</td><td><StatusBadge status={p.status} /></td></tr>)}
        </tbody></table></div></div>
      )}

      {tab === 'matches' && (
        <div className="card space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-surface-700/50 rounded-lg p-4">
              <div><p className="font-medium text-white">{m.roundLabel}</p><p className="text-xs text-surface-400">{new Date(m.scheduledAt).toLocaleString()}</p></div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
