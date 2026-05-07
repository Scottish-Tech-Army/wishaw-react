import { useEffect, useState } from 'react';
import { badgeApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await badgeApi.getAll();
      setBadges(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
    setShowModal(true);
  }

  function openEdit(badge) {
    setEditing(badge);
    setForm({ name: badge.name, description: badge.description || '' });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await badgeApi.update(editing.id, form);
      } else {
        await badgeApi.create(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save badge');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this badge? All associated sub-badges will also be affected.')) return;
    try {
      await badgeApi.remove(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-row mb-2">
        <div className="page-header">
          <h1>🏅 Manage Badges</h1>
          <p>Create and manage core badge categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Badge</button>
      </div>

      {/* Desktop table */}
      <table className="data-table desktop-only">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {badges.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td><strong>{b.name}</strong></td>
              <td className="text-light">{b.description}</td>
              <td>{new Date(b.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {badges.length === 0 && (
            <tr><td colSpan={5} className="text-center text-light">No badges found</td></tr>
          )}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="mobile-card-list">
        {badges.map((b) => (
          <div className="mobile-card" key={b.id}>
            <div className="mobile-card-row"><span className="mobile-card-label">Name</span><span className="mobile-card-value"><strong>{b.name}</strong></span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Description</span><span className="mobile-card-value">{b.description || '—'}</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Created</span><span className="mobile-card-value">{new Date(b.createdAt).toLocaleDateString()}</span></div>
            <div className="mobile-card-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Delete</button>
            </div>
          </div>
        ))}
        {badges.length === 0 && <p className="text-light text-center">No badges found</p>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Badge' : 'New Badge'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
