import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loading, StatusBadge, Tabs } from '../components/ui';
import type { Module, SubBadge } from '../types';

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mod, setMod] = useState<Module | null>(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) api.getModule(id).then((m) => setMod(m ?? null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!mod) return <div className="text-center py-20 text-surface-400">Module not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-surface-400">
        <Link to="/modules" className="hover:text-white">Modules</Link> / <span className="text-white">{mod.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">{mod.name}</h1>
          <p className="text-surface-400">{mod.game} · {mod.durationWeeks} weeks</p>
        </div>
        <StatusBadge status={mod.status} />
      </div>

      <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'schedule', label: 'Schedule' }, { id: 'badges', label: 'Sub-Badges' }]} activeTab={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="card">
          <p className="text-surface-300">{mod.description}</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="stat-card"><div className="stat-value">{mod.durationWeeks}</div><div className="stat-label">Weeks</div></div>
            <div className="stat-card"><div className="stat-value">{mod.subBadges.length}</div><div className="stat-label">Sub-Badges</div></div>
            <div className="stat-card"><div className="stat-value">{mod.subBadges.reduce((s, b) => s + b.points, 0)}</div><div className="stat-label">Total Points</div></div>
          </div>
        </div>
      )}

      {tab === 'schedule' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Week</th><th>Focus</th><th>Sub-Badge</th></tr></thead>
              <tbody>
                {mod.schedule.map((s) => {
                  const sb = mod.subBadges.find((b: SubBadge) => b.id === s.subBadgeId);
                  return (
                    <tr key={s.weekNo}>
                      <td className="font-medium">{s.weekNo}</td>
                      <td>{s.focus}</td>
                      <td>{sb ? <span className="badge-primary">{sb.name} (+{sb.points}pts)</span> : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mod.subBadges.map((sb: SubBadge) => (
            <div key={sb.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{sb.name}</h3>
                <span className="text-primary-400 font-medium">{sb.points} pts</span>
              </div>
              <p className="text-sm text-surface-400 mb-2">{sb.description}</p>
              <p className="text-xs text-surface-500">Main Badge: {sb.mainBadgeName}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {sb.skills.map((sk) => <span key={sk} className="bg-surface-700 text-surface-300 text-xs px-2 py-0.5 rounded">{sk}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
