import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moduleApi, badgeApi } from '../services/api';
import Spinner from '../components/Spinner';

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const [mod, setMod] = useState(null);
  const [subBadges, setSubBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, sbRes] = await Promise.all([
          moduleApi.getById(moduleId),
          badgeApi.getSubBadgesByModule(moduleId),
        ]);
        setMod(mRes.data);
        setSubBadges(sbRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId]);

  if (loading) return <Spinner />;
  if (!mod) return <p>Module not found.</p>;

  const totalPoints = subBadges.reduce((sum, sb) => sum + sb.points, 0);

  return (
    <div>
      <Link to="/modules" className="text-sm" style={{ display: 'inline-block', marginBottom: '1rem' }}>← Back to Modules</Link>

      <div className="page-header">
        <h1>📚 {mod.name}</h1>
        {mod.approved ? (
          <div className="page-header__meta">
            <span className="level-tag GOLD">✓ Approved</span>
          </div>
        ) : (
          <div className="page-header__meta">
            <span className="level-tag SILVER">Pending</span>
          </div>
        )}
        <p>{mod.description || 'No description available'}</p>
      </div>

      {/* Module stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{subBadges.length}</div>
          <div className="stat-label">Challenges</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPoints}</div>
          <div className="stat-label">Total XP Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🏢</div>
          <div className="stat-label">{mod.centreName || '—'}</div>
        </div>
      </div>

      {/* Sub-badges list */}
      <h2 style={{ marginBottom: '0.75rem' }}>⭐ Challenges / Sub-Badges</h2>
      {subBadges.length === 0 ? (
        <p className="text-light">No challenges have been added to this module yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Badge Category</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {subBadges.map((sb) => (
              <tr key={sb.id}>
                <td><strong>{sb.name}</strong></td>
                <td>{sb.badgeName}</td>
                <td>{sb.points} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

