import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loading } from '../../components/ui';
import type { Centre, Group } from '../../types';

export default function AdminCentres() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCentres(), api.getGroups()]).then(([c, g]) => { setCentres(c); setGroups(g); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="page-header">Centres & Groups</h1>
      {centres.map((c) => (
        <div key={c.id} className="card">
          <h2 className="font-semibold text-white text-lg mb-1">{c.name}</h2>
          <p className="text-sm text-surface-400 mb-3">{c.location}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {groups.filter((g) => g.centreId === c.id).map((g) => (
              <div key={g.id} className="bg-surface-700/50 rounded-xl p-3">
                <h3 className="text-sm font-medium text-white">{g.name}</h3>
                <p className="text-xs text-surface-400">{g.game} · {g.memberCount} members</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
