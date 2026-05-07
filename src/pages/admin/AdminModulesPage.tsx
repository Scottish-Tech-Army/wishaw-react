import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { moduleApi, centreApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function AdminModulesPage() {
  const { user, isMainAdmin } = useAuth();
  const [modules, setModules] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', centreId: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([moduleApi.getAll(), centreApi.getAll()]);
      let mods = mRes.data;
      // Centre admin only sees their own centre's modules
      if (!isMainAdmin && user.centreId) {
        mods = mods.filter((m) => m.centreId === user.centreId);
      }
      setModules(mods);
      setCentres(cRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    // Centre admin: auto-lock to their own centre
    setForm({
      name: '',
      description: '',
      centreId: isMainAdmin ? (centres[0]?.id || '') : (user.centreId || '')
    });
    setError('');
    setShowModal(true);
  }

  function openEdit(mod) {
    setEditing(mod);
    setForm({ name: mod.name, description: mod.description || '', centreId: mod.centreId || '' });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, centreId: Number(form.centreId) };
    try {
      if (editing) {
        await moduleApi.update(editing.id, payload);
      } else {
        await moduleApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save module');
    }
  }

  async function handleApprove(id) {
    try { await moduleApi.approve(id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to approve'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this module?')) return;
    try { await moduleApi.remove(id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-row mb-2">
        <div className="page-header">
          <h1>📦 Manage Modules</h1>
          <p>Create, approve and manage game modules</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Module</button>
      </div>

      {/* Desktop table */}
      <table className="data-table desktop-only">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Centre</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td><strong>{m.name}</strong><br /><span className="text-sm text-light">{m.description}</span></td>
              <td>{m.centreName || '—'}</td>
              <td>{m.approved ? <span className="level-tag GOLD">✓ Approved</span> : <span className="level-tag SILVER">Pending</span>}</td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  {!m.approved && isMainAdmin && <button className="btn btn-success btn-sm" onClick={() => handleApprove(m.id)}>Approve</button>}
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {modules.length === 0 && <tr><td colSpan={5} className="text-center text-light">No modules yet</td></tr>}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="mobile-card-list">
        {modules.map((m) => (
          <div className="mobile-card" key={m.id}>
            <div className="mobile-card-row"><span className="mobile-card-label">Name</span><span className="mobile-card-value"><strong>{m.name}</strong></span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Centre</span><span className="mobile-card-value">{m.centreName || '—'}</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Status</span><span className="mobile-card-value">{m.approved ? <span className="level-tag GOLD">✓ Approved</span> : <span className="level-tag SILVER">Pending</span>}</span></div>
            <div className="mobile-card-actions">
              {!m.approved && isMainAdmin && <button className="btn btn-success btn-sm" onClick={() => handleApprove(m.id)}>Approve</button>}
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
            </div>
          </div>
        ))}
        {modules.length === 0 && <p className="text-light text-center">No modules yet</p>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Module' : 'New Module'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Module Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Centre</label>
              {isMainAdmin ? (
                <select className="form-control" value={form.centreId} onChange={(e) => setForm({ ...form, centreId: e.target.value })} required>
                  <option value="">Select centre…</option>
                  {centres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input className="form-control" value={centres.find(c => c.id === user.centreId)?.name || 'Your Centre'} disabled />
              )}
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
