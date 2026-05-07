import { useEffect, useState } from 'react';
import { centreApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function AdminCentresPage() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await centreApi.getAll();
      setCentres(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', code: '' });
    setError('');
    setShowModal(true);
  }

  function openEdit(centre) {
    setEditing(centre);
    setForm({ name: centre.name, code: centre.code });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await centreApi.update(editing.id, form);
      } else {
        await centreApi.create(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save centre');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this centre?')) return;
    try {
      await centreApi.remove(id);
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
          <h1>🏢 Manage Centres</h1>
          <p>Create and manage YMCA centres</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Centre</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {centres.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td><strong>{c.name}</strong></td>
              <td><code>{c.code}</code></td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {centres.length === 0 && (
            <tr><td colSpan={4} className="text-center text-light">No centres yet</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <Modal title={editing ? 'Edit Centre' : 'New Centre'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Centre Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Code (e.g. WISHAW)</label>
              <input className="form-control" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
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

