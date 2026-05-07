import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loading, StatusBadge } from '../components/ui';
import type { Module } from '../types';

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getModules().then(setModules).finally(() => setLoading(false)); }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Modules</h1>
        <p className="text-surface-400">Explore courses (12-16 weeks) to earn sub-badges and level up your main badges.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((m) => (
          <Link key={m.id} to={`/modules/${m.id}`} className="card-hover">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white text-lg">{m.name}</h2>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-sm text-surface-400 mb-3">{m.description}</p>
            <div className="flex items-center gap-4 text-xs text-surface-400">
              <span>🎮 {m.game}</span>
              <span>📅 {m.durationWeeks} weeks</span>
              <span>🏅 {m.subBadges.length} sub-badges</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
