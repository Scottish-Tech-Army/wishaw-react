import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi, badgeApi, moduleApi, progressApi } from '../../services/api';
import Spinner from '../../components/Spinner';

export default function AdminProgressPage() {
  const { user, isMainAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [subBadges, setSubBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubBadge, setSelectedSubBadge] = useState('');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to award sub-badge');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  const selectedSubBadgeObj = subBadges.find((sb) => String(sb.id) === String(selectedSubBadge));

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
          <select className="form-control" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">Choose a player…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || u.username} ({u.centreName || 'No centre'})
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
          <select className="form-control" value={selectedSubBadge} onChange={(e) => setSelectedSubBadge(e.target.value)} disabled={subBadges.length === 0}>
            <option value="">{subBadges.length === 0 ? 'Select a module first…' : 'Choose a challenge…'}</option>
            {subBadges.map((sb) => (
              <option key={sb.id} value={sb.id}>{sb.name} — {sb.points} XP ({sb.badgeName})</option>
            ))}
          </select>
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
