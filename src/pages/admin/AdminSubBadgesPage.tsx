import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { badgeApi, moduleApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function AdminSubBadgesPage() {
  const { user, isMainAdmin } = useAuth();
  const [subBadges, setSubBadges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', points: 5, badgeId: '', moduleId: '' });
  const [error, setError] = useState('');
  const [filterBadge, setFilterBadge] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [bRes, mRes] = await Promise.all([badgeApi.getAll(), moduleApi.getAll()]);
      setBadges(bRes.data);

      // Only show approved modules; centre admin sees only their centre's approved modules
      let moduleList = mRes.data.filter((m) => m.approved);
      if (!isMainAdmin && user.centreId) {
        moduleList = moduleList.filter((m) => m.centreId === user.centreId);
      }
      setModules(moduleList);

      // Load all sub-badges for every badge
      const allSubs = [];
      for (const b of bRes.data) {
        const sbRes = await badgeApi.getSubBadgesByBadge(b.id);
        allSubs.push(...sbRes.data);
      }
      setSubBadges(allSubs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', points: 5, badgeId: badges[0]?.id || '', moduleId: modules[0]?.id || '' });
    setError('');
    setShowModal(true);
  }

  function openEdit(sb) {
    setEditing(sb);
    setForm({ name: sb.name, points: sb.points, badgeId: sb.badgeId, moduleId: sb.moduleId });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, points: Number(form.points), badgeId: Number(form.badgeId), moduleId: Number(form.moduleId) };
    try {
      if (editing) {
        await badgeApi.updateSubBadge(editing.id, payload);
      } else {
        await badgeApi.createSubBadge(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save sub-badge');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this sub-badge?')) return;
    try {
      await badgeApi.deleteSubBadge(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  const filtered = filterBadge
    ? subBadges.filter((sb) => String(sb.badgeId) === filterBadge)
    : subBadges;

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-row mb-2">
        <div className="page-header">
          <h1>⭐ Manage Sub-Badges</h1>
          <p>Create and manage challenges / sub-badges</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Sub-Badge</button>
      </div>

      <div className="filter-bar">
        <select className="form-control" style={{ maxWidth: 250 }} value={filterBadge} onChange={(e) => setFilterBadge(e.target.value)}>
          <option value="">All Badge Categories</option>
          {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Desktop table */}
      <table className="data-table desktop-only">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Points</th>
            <th>Badge</th>
            <th>Module</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((sb) => (
            <tr key={sb.id}>
              <td>{sb.id}</td>
              <td><strong>{sb.name}</strong></td>
              <td>{sb.points} XP</td>
              <td>{sb.badgeName}</td>
              <td>{sb.moduleName}</td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(sb)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sb.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="text-center text-light">No sub-badges found</td></tr>
          )}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="mobile-card-list">
        {filtered.map((sb) => (
          <div className="mobile-card" key={sb.id}>
            <div className="mobile-card-row"><span className="mobile-card-label">Name</span><span className="mobile-card-value"><strong>{sb.name}</strong></span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Points</span><span className="mobile-card-value">{sb.points} XP</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Badge</span><span className="mobile-card-value">{sb.badgeName}</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Module</span><span className="mobile-card-value">{sb.moduleName}</span></div>
            <div className="mobile-card-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(sb)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sb.id)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-light text-center">No sub-badges found</p>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Sub-Badge' : 'New Sub-Badge'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Points (XP)</label>
              <input className="form-control" type="number" min={0} value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Badge Category</label>
              <select className="form-control" value={form.badgeId} onChange={(e) => setForm({ ...form, badgeId: e.target.value })} required>
                <option value="">Select badge…</option>
                {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Module</label>
              <select className="form-control" value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} required>
                <option value="">Select module…</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
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
