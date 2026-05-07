import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loading, Tabs } from '../components/ui';
import { getBadgeLevel, BADGE_LEVEL_COLORS } from '../utils/badge-levels';
import type { LeaderboardEntry } from '../types';
import type { BadgeLevel, MainBadgeName } from '../types';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getGlobalLeaderboard().then(setEntries).finally(() => setLoading(false)); }, []);

  if (loading) return <Loading />;

  const sorted = [...entries].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Leaderboard</h1>
        <p className="text-surface-400">Compare progress across all players and centres.</p>
      </div>

      <Tabs tabs={[{ id: 'global', label: 'Global' }, { id: 'centre', label: 'By Centre' }]} activeTab={tab} onChange={setTab} />

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Player</th><th>Centre</th><th>Total XP</th><th>Modules</th>
                <th>🎮</th><th>🤝</th><th>🌐</th><th>🌟</th><th>💻</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e, i) => (
                <tr key={e.userId}>
                  <td className="font-bold text-primary-400">{i + 1}</td>
                  <td className="font-medium text-white">{e.displayName}</td>
                  <td className="text-surface-400">{e.centreName}</td>
                  <td className="font-semibold">{e.totalPoints}</td>
                  <td>{e.completedModules}</td>
                  {(['Game Mastery', 'Teamwork', 'Esports Citizen', 'Personal Development', 'Digital Skills'] as MainBadgeName[]).map((badge) => {
                    const level = (e.badgeLevels[badge] || 'None') as BadgeLevel;
                    return <td key={badge}><span className={`text-xs px-1.5 py-0.5 rounded ${BADGE_LEVEL_COLORS[level]}`}>{level}</span></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length === 0 && <p className="text-center text-surface-400 py-8">No leaderboard data yet.</p>}
      </div>
    </div>
  );
}
