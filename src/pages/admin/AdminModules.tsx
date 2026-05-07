import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loading, StatusBadge } from '../../components/ui';
import type { Module } from '../../types';

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getModules().then(setModules).finally(() => setLoading(false)); }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Modules Management</h1>
      </div>
      <div className="space-y-3">
        {modules.map((m) => (
          <div key={m.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{m.name}</h3>
              <p className="text-sm text-surface-400">{m.game} · {m.durationWeeks} weeks · {m.subBadges.length} sub-badges</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={m.status} />
              <Link to={`/modules/${m.id}`} className="btn-secondary btn-sm">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
