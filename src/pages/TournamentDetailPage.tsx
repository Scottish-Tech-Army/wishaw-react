import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loading, StatusBadge, Tabs } from '../components/ui';
import { useAuthStore } from '../store/auth-store';
import toast from 'react-hot-toast';
import type { Tournament, Participant, Match, LeaderboardEntry } from '../types';
import { formatDateTime } from '../utils/date-time';

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'join' | 'leave' | null>(null);

  const loadTournamentData = async (tournamentId: string) => {
    const [t, p, m, l] = await Promise.all([
      api.getTournament(tournamentId),
      api.getParticipants(tournamentId),
      api.getMatches(tournamentId),
      api.getLeaderboard(tournamentId),
    ]);
    setTournament(t ?? null);
    setParticipants(p);
    setMatches(m);
    setLeaderboard(l);
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await loadTournamentData(id);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <Loading />;
  if (!tournament) return <div className="text-center py-20 text-surface-400">Tournament not found</div>;

  const isParticipant = participants.some((p) => p.userId === user?.id);

  const handleJoin = async () => {
    if (actionLoading || !tournament) return;
    setActionLoading('join');
    try {
      await api.joinTournament(tournament.id);
      await loadTournamentData(tournament.id);
      toast.success('Joined!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async () => {
    if (actionLoading || !tournament) return;
    setActionLoading('leave');
    try {
      await api.leaveTournament(tournament.id);
      await loadTournamentData(tournament.id);
      toast.success('Left tournament');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-surface-400">
        <Link to="/tournaments" className="hover:text-white">Tournaments</Link> / <span className="text-white">{tournament.name}</span>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="page-header">{tournament.name}</h1><p className="text-surface-400">{tournament.venue}</p></div>
        <div className="flex items-center gap-3">
          <StatusBadge status={tournament.status} />
          {tournament.status === 'PUBLISHED' && !isParticipant && (
            <button className="btn-primary" onClick={handleJoin} disabled={actionLoading === 'join'}>
              {actionLoading === 'join' ? 'Joining...' : 'Join'}
            </button>
          )}
          {isParticipant && (
            <button className="btn-secondary" onClick={handleLeave} disabled={actionLoading === 'leave'}>
              {actionLoading === 'leave' ? 'Leaving...' : 'Leave'}
            </button>
          )}
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

      <Tabs tabs={[{ id: 'details', label: 'Details' }, { id: 'participants', label: 'Participants' }, { id: 'schedule', label: 'Schedule' }, { id: 'leaderboard', label: 'Leaderboard' }]} activeTab={tab} onChange={setTab} />

      {tab === 'details' && (
        <div className="card">
          <p className="text-surface-300 mb-4">{tournament.description}</p>
          {tournament.rules && <p className="text-sm text-surface-400 mb-4">{tournament.rules}</p>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card"><div className="stat-value">{tournament.participantCount}</div><div className="stat-label">Players</div></div>
            <div className="stat-card"><div className="stat-value">{tournament.capacity}</div><div className="stat-label">Capacity</div></div>
            <div className="stat-card"><div className="stat-value">{tournament.type}</div><div className="stat-label">Type</div></div>
            <div className="stat-card"><div className="stat-value">{matches.length}</div><div className="stat-label">Matches</div></div>
          </div>
          {(tournament.minAge || tournament.maxAge) ? (
            <div className="mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4">
              <p className="text-sm font-medium text-yellow-300">⚠️ Age restriction</p>
              <p className="text-sm text-yellow-200/80 mt-1">
                {tournament.minAge && tournament.maxAge
                  ? `Players must be between ${tournament.minAge} and ${tournament.maxAge} years old`
                  : tournament.minAge
                    ? `Players must be at least ${tournament.minAge} years old`
                    : `Players must be ${tournament.maxAge} years old or younger`}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {tab === 'participants' && (
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-surface-700/50 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 text-sm font-semibold">{p.displayName[0]}</div>
                <div><p className="text-sm text-white">{p.displayName}</p><p className="text-xs text-surface-400">{p.status}</p></div>
              </div>
            ))}
          </div>
          {participants.length === 0 && <p className="text-center text-surface-400 py-8">No participants yet.</p>}
        </div>
      )}

      {tab === 'schedule' && (
        <div className="card space-y-3">
          {matches.map((m) => (
            <Link key={m.id} to={`/matches/${m.id}`} className="flex items-center justify-between bg-surface-700/50 rounded-xl p-4 hover:bg-surface-700 transition-colors">
              <div><p className="font-medium text-white">{m.roundLabel}</p><p className="text-xs text-surface-400">{new Date(m.scheduledAt).toLocaleString()}</p></div>
              <StatusBadge status={m.status} />
            </Link>
          ))}
          {matches.length === 0 && <p className="text-center text-surface-400 py-8">No matches scheduled yet.</p>}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>#</th><th>Player</th><th>Points</th></tr></thead>
              <tbody>
                {leaderboard.sort((a, b) => b.totalPoints - a.totalPoints).map((e, i) => (
                  <tr key={e.userId}><td className="font-bold text-primary-400">{i + 1}</td><td className="text-white">{e.displayName}</td><td>{e.totalPoints}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {leaderboard.length === 0 && <p className="text-center text-surface-400 py-8">No scoreboard yet.</p>}
        </div>
      )}
    </div>
  );
}
