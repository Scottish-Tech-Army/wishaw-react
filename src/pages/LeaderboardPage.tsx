import { useEffect, useState } from 'react';
import { leaderboardApi, centreApi } from '../services/api';
import Spinner from '../components/Spinner';
import { formatAge } from '../utils/age';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    centreApi.getAll().then((res) => setCentres(res.data)).catch(() => {});
    loadLeaderboard();
  }, []);

  async function loadLeaderboard(centreId?: string | null) {
    setLoading(true);
    try {
      const res = centreId
        ? await leaderboardApi.getByCentre(centreId)
        : await leaderboardApi.getGlobal();
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCentreChange(e) {
    const val = e.target.value;
    setSelectedCentre(val);
    loadLeaderboard(val || null);
  }

  return (
    <div>
      <div className="page-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top players ranked by total XP</p>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <select className="form-control" style={{ maxWidth: 250 }} value={selectedCentre} onChange={handleCentreChange}>
          <option value="">All Centres (Global)</option>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Age</th>
              <th>Centre</th>
              <th>Total XP</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.userId}>
                <td>
                  <span className={`leaderboard-rank ${e.rank <= 3 ? 'rank-' + e.rank : ''}`}>
                    {e.rank}
                  </span>
                </td>
                <td><strong>{e.displayName || e.username}</strong></td>
                <td>{formatAge(e.dob)}</td>
                <td>{e.centreName || '—'}</td>
                <td><strong>{e.totalXp}</strong> XP</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="text-center text-light">No leaderboard data yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
