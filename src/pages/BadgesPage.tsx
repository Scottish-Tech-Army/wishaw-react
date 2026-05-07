import { useEffect, useState } from 'react';
import { badgeApi } from '../services/api';
import Spinner from '../components/Spinner';

const BADGE_ICONS = {
  'Game Mastery': '🎮',
  'Teamwork': '🤝',
  'Esports Citizen': '🌐',
  'Personal Development': '🌟',
  'Digital Skills': '💻',
};

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [subBadges, setSubBadges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    badgeApi.getAll().then((res) => {
      setBadges(res.data);
      if (res.data.length > 0) {
        selectBadge(res.data[0]);
      }
      setLoading(false);
    });
  }, []);

  async function selectBadge(badge) {
    setSelected(badge.id);
    try {
      const res = await badgeApi.getSubBadgesByBadge(badge.id);
      setSubBadges(res.data);
    } catch (err) {
      console.error(err);
      setSubBadges([]);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>🏅 Badges</h1>
        <p>The 5 core badge categories and their challenges</p>
      </div>

      {/* Badge tabs */}
      <div className="tabs">
        {badges.map((b) => (
          <button
            key={b.id}
            className={`tab ${selected === b.id ? 'active' : ''}`}
            onClick={() => selectBadge(b)}
          >
            {BADGE_ICONS[b.name] || '🏅'} {b.name}
          </button>
        ))}
      </div>

      {/* Selected badge info */}
      {badges.filter(b => b.id === selected).map(b => (
        <div key={b.id} className="card mb-2">
          <h3>{BADGE_ICONS[b.name] || '🏅'} {b.name}</h3>
          <p className="text-light">{b.description}</p>
        </div>
      ))}

      {/* Sub-badges table */}
      <h3 style={{ margin: '1rem 0 0.5rem' }}>Challenges / Sub-Badges</h3>
      {subBadges.length === 0 ? (
        <p className="text-light">No challenges found for this badge.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Points</th>
              <th>Module</th>
            </tr>
          </thead>
          <tbody>
            {subBadges.map((sb) => (
              <tr key={sb.id}>
                <td><strong>{sb.name}</strong></td>
                <td>{sb.points} XP</td>
                <td>{sb.moduleName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

