import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { progressApi, leaderboardApi, centreApi } from '../services/api';
import BadgeCard from '../components/BadgeCard';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { formatAge } from '../utils/age';

export default function DashboardPage() {
  const { user, isAdmin, isMainAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    async function load() {
      try {
        const [profileRes, lbRes] = await Promise.all([
          progressApi.getProfile(user.userId),
          user.centreId
            ? leaderboardApi.getByCentre(user.centreId)
            : leaderboardApi.getGlobal(),
        ]);
        setProfile(profileRes.data);
        setLeaderboard(lbRes.data.slice(0, 5));
        if (isAdmin) {
          const cRes = await centreApi.getAll();
          setCentres(cRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header page-header--dashboard">
        <h1>
          <span>📊 Welcome back,</span>{' '}
          <span className="dashboard-greeting__name">{profile?.displayName || user?.username}!</span>
        </h1>
        <p>Here's your progress overview</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{profile?.overallXp || 0}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile?.completedSubBadges || 0}</div>
          <div className="stat-label">Challenges Done</div>
        </div>
        {isMainAdmin && (
          <div className="stat-card">
            <div className="stat-value">{profile?.badges?.length || 0}</div>
            <div className="stat-label">Badge Categories</div>
          </div>
        )}
        {isMainAdmin && (
          <div className="stat-card">
            <div className="stat-value">{centres.length}</div>
            <div className="stat-label">Centres</div>
          </div>
        )}
      </div>

      {/* Badge Progress — for all roles */}
      <h2 style={{ marginBottom: '1rem' }}>🏅 Badge Progress</h2>
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        {profile?.badges?.map((b) => (
          <BadgeCard key={b.badgeId} badge={b} />
        ))}
      </div>

      {/* Mini Leaderboard */}
      <div className="flex justify-between items-center mb-2">
        <h2>🏆 Top Players</h2>
        <Link to="/leaderboard" className="btn btn-outline btn-sm">View All</Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Age</th>
            <th>Centre</th>
            <th>XP</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.userId}>
              <td>
                <span className={`leaderboard-rank ${entry.rank <= 3 ? 'rank-' + entry.rank : ''}`}>
                  {entry.rank}
                </span>
              </td>
              <td><strong>{entry.displayName || entry.username}</strong></td>
              <td>{formatAge(entry.dob)}</td>
              <td>{entry.centreName || '—'}</td>
              <td><strong>{entry.totalXp}</strong> XP</td>
            </tr>
          ))}
          {leaderboard.length === 0 && (
            <tr><td colSpan={5} className="text-center text-light">No data yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
