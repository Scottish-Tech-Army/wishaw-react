import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { legacyPointsApi, userApi, badgeApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { formatAge } from '../../utils/age';

export default function AdminLegacyPointsPage() {
  const { user, isMainAdmin } = useAuth();
  const [legacyPoints, setLegacyPoints] = useState([]);
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ userId: '', badgeId: '', points: 0, reason: '' });
  const [error, setError] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [lpRes, uRes, bRes] = await Promise.all([
        legacyPointsApi.getAll(),
        userApi.getAll(),
        badgeApi.getAll(),
      ]);

      let playerList = uRes.data.filter((u) => u.role === 'USER');
      if (!isMainAdmin && user.centreId) {
        playerList = playerList.filter((u) => u.centreId === user.centreId);
      }

      setLegacyPoints(lpRes.data);
      setUsers(playerList);
      setBadges(bRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ userId: '', badgeId: '', points: 0, reason: '' });
    setError('');
    setShowModal(true);
  }

  function openEdit(lp) {
    setEditing(lp);
    setForm({
      userId: String(lp.userId),
      badgeId: String(lp.badgeId),
      points: lp.points,
      reason: lp.reason || '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.userId || !form.badgeId) {
      setError('Please select a user and a badge');
      return;
    }
    if (Number(form.points) < 0) {
      setError('Points must be non-negative');
      return;
    }

    const payload = {
      userId: Number(form.userId),
      badgeId: Number(form.badgeId),
      points: Number(form.points),
      reason: form.reason || null,
    };

    try {
      if (editing) {
        await legacyPointsApi.update(editing.id, payload);
      } else {
        await legacyPointsApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save legacy points');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this legacy points entry?')) return;
    try {
      await legacyPointsApi.remove(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  if (loading) return <Spinner />;

  const filtered = filterUser
    ? legacyPoints.filter((lp) => String(lp.userId) === filterUser)
    : legacyPoints;

  const visibleUserIds = new Set(users.map((u) => u.id));
  const visibleLegacyPoints = filtered.filter((lp) => isMainAdmin || visibleUserIds.has(lp.userId));

  return (
    <div>
      <div className="page-header-row mb-2">
        <div className="page-header">
          <h1>🏛️ Legacy Points</h1>
          <p>Manage initial/historical points for users — these are added to badge totals without sub-badge breakdown</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Legacy Points</button>
      </div>

      <div className="card mb-2" style={{ padding: '1rem' }}>
        <p className="text-light" style={{ fontSize: '0.85rem' }}>
          <strong>How legacy points work:</strong> Legacy points represent XP earned before the digital system was introduced.
          They are added to each user's badge total alongside sub-badge earned points. Each user can have one legacy entry per badge.
        </p>
      </div>

      <div className="card mb-2" style={{ padding: '0.75rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Filter by Player</label>
          <select className="form-control" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">All Players</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || u.username} ({formatAge(u.dob)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Badge</th>
            <th>Points</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleLegacyPoints.map((lp) => (
            <tr key={lp.id}>
              <td><strong>{lp.displayName || lp.username}</strong></td>
              <td>{lp.badgeName}</td>
              <td><strong>{lp.points} XP</strong></td>
              <td className="text-light">{lp.reason || '—'}</td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(lp)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lp.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {visibleLegacyPoints.length === 0 && (
            <tr><td colSpan={5} className="text-center text-light">No legacy points found</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <Modal title={editing ? 'Edit Legacy Points' : 'Add Legacy Points'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Player</label>
              <select
                className="form-control"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                disabled={!!editing}
                required
              >
                <option value="">Choose a player…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName || u.username} ({formatAge(u.dob)}) — {u.centreName || 'No centre'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Badge</label>
              <select
                className="form-control"
                value={form.badgeId}
                onChange={(e) => setForm({ ...form, badgeId: e.target.value })}
                disabled={!!editing}
                required
              >
                <option value="">Choose a badge…</option>
                {badges.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Points</label>
              <input
                className="form-control"
                type="number"
                min={0}
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <input
                className="form-control"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Pre-system tournament achievements"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
