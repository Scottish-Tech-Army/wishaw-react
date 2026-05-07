import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi, badgeApi, moduleApi, progressApi } from '../../services/api';
import Spinner from '../../components/Spinner';
import { formatAge } from '../../utils/age';

export default function AdminProgressPage() {
  const { user, isMainAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [subBadges, setSubBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubBadge, setSelectedSubBadge] = useState('');
  const [completedSubBadgeIds, setCompletedSubBadgeIds] = useState<Set<number>>(new Set());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([userApi.getAll(), moduleApi.getAll()])
      .then(([uRes, mRes]) => {
        let playerList = uRes.data.filter((u) => u.role === 'USER');
        let moduleList = mRes.data.filter((m) => m.approved);

        // Centre admin: only their own centre's users and modules
        if (!isMainAdmin && user.centreId) {
          playerList = playerList.filter((u) => u.centreId === user.centreId);
          moduleList = moduleList.filter((m) => m.centreId === user.centreId);
        }

        setUsers(playerList);
        setModules(moduleList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleUserChange(userId: string) {
    setSelectedUser(userId);
    setSelectedSubBadge('');
    setCompletedSubBadgeIds(new Set());
    if (!userId) return;
    try {
      const res = await progressApi.getCompletedSubBadgeIds(Number(userId));
      setCompletedSubBadgeIds(new Set(res.data));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleModuleChange(moduleId) {
    setSelectedModule(moduleId);
    setSelectedSubBadge('');
    setSubBadges([]);
    if (!moduleId) return;
    try {
      const res = await badgeApi.getSubBadgesByModule(moduleId);
      setSubBadges(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAward() {
    if (!selectedUser || !selectedSubBadge) return;
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      const res = await progressApi.completeSubBadge({
        userId: Number(selectedUser),
        subBadgeId: Number(selectedSubBadge),
      });
      setResult(res.data);
      // Add the newly awarded sub-badge to the completed set
      setCompletedSubBadgeIds((prev) => new Set(prev).add(Number(selectedSubBadge)));
      setSelectedSubBadge('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to award sub-badge');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  const selectedSubBadgeObj = subBadges.find((sb) => String(sb.id) === String(selectedSubBadge));
  const availableSubBadges = subBadges.filter((sb) => !completedSubBadgeIds.has(sb.id));

  return (
    <div>
      <div className="page-header">
        <h1>✅ Award Progress</h1>
        <p>Mark a sub-badge as completed for a user — XP is awarded automatically</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        {/* Step 1: Select user */}
        <div className="form-group">
          <label>1. Select Player</label>
          <select className="form-control" value={selectedUser} onChange={(e) => handleUserChange(e.target.value)}>
            <option value="">Choose a player…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || u.username} ({formatAge(u.dob)}) — {u.centreName || 'No centre'}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select module */}
        <div className="form-group">
          <label>2. Select Module</label>
          <select className="form-control" value={selectedModule} onChange={(e) => handleModuleChange(e.target.value)}>
            <option value="">Choose a module…</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.centreName})</option>
            ))}
          </select>
        </div>

        {/* Step 3: Select sub-badge */}
        <div className="form-group">
          <label>3. Select Challenge / Sub-Badge</label>
          <select
            className="form-control"
            value={selectedSubBadge}
            onChange={(e) => setSelectedSubBadge(e.target.value)}
            disabled={subBadges.length === 0}
          >
            <option value="">
              {subBadges.length === 0
                ? 'Select a module first…'
                : availableSubBadges.length === 0
                  ? 'All challenges completed! 🎉'
                  : 'Choose a challenge…'}
            </option>
            {subBadges.map((sb) => {
              const isCompleted = completedSubBadgeIds.has(sb.id);
              return (
                <option key={sb.id} value={sb.id} disabled={isCompleted}>
                  {sb.name} — {sb.points} XP ({sb.badgeName}){isCompleted ? ' ✅ Already completed' : ''}
                </option>
              );
            })}
          </select>
          {selectedUser && subBadges.length > 0 && completedSubBadgeIds.size > 0 && (
            <p className="text-sm" style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
              {subBadges.filter((sb) => completedSubBadgeIds.has(sb.id)).length} of {subBadges.length} challenges already completed
            </p>
          )}
        </div>

        {/* Preview */}
        {selectedSubBadgeObj && selectedUser && (
          <div className="card" style={{ background: 'var(--surface-hover)', marginBottom: '1rem' }}>
            <p className="text-sm">
              <strong>Preview:</strong> Awarding <strong>{selectedSubBadgeObj.name}</strong> ({selectedSubBadgeObj.points} XP)
              to <strong>{users.find((u) => String(u.id) === selectedUser)?.displayName}</strong>
              → Badge: {selectedSubBadgeObj.badgeName}
            </p>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {result && (
          <div className="card" style={{ background: 'var(--surface-hover)', marginBottom: '1rem', border: '1px solid var(--secondary)' }}>
            <p><strong>✅ Success!</strong></p>
            <p>Badge: <strong>{result.badgeName}</strong></p>
            <p>New Total: <strong>{result.totalPoints} XP</strong></p>
            <p>Level: <span className={`level-tag ${result.level}`}>{result.level}</span></p>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleAward}
          disabled={!selectedUser || !selectedSubBadge || submitting}
          style={{ width: '100%' }}
        >
          {submitting ? 'Awarding…' : '🏆 Award Sub-Badge'}
        </button>
      </div>
    </div>
  );
}
