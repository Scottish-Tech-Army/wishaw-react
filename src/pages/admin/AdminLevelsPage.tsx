import { useEffect, useState } from 'react';
import { levelApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function AdminLevelsPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', minPoints: 0, maxPoints: -1, displayOrder: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await levelApi.getAll();
      setLevels(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', minPoints: 0, maxPoints: -1, displayOrder: levels.length + 1 });
    setError('');
    setShowModal(true);
  }

  function openEdit(level) {
    setEditing(level);
    setForm({
      name: level.name,
      minPoints: level.minPoints,
      maxPoints: level.maxPoints,
      displayOrder: level.displayOrder,
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      minPoints: Number(form.minPoints),
      maxPoints: Number(form.maxPoints),
      displayOrder: Number(form.displayOrder),
    };

    // Validate min <= max (unless max is -1 for unlimited)
    if (payload.maxPoints !== -1 && payload.minPoints > payload.maxPoints) {
      setError('Min Points cannot be greater than Max Points');
      return;
    }

    // Check for overlap with other levels
    const otherLevels = levels.filter((l) => !(editing && l.id === editing.id));
    for (const other of otherLevels) {
      const oMin = other.minPoints;
      const oMax = other.maxPoints;

      // Determine effective max for comparison (-1 means unlimited)
      const newMax = payload.maxPoints === -1 ? Infinity : payload.maxPoints;
      const existingMax = oMax === -1 ? Infinity : oMax;

      if (payload.minPoints <= existingMax && newMax >= oMin) {
        setError(`Point range overlaps with level "${other.name}" (${oMin}–${oMax === -1 ? '∞' : oMax})`);
        return;
      }
    }

    try {
      if (editing) {
        await levelApi.update(editing.id, payload);
      } else {
        await levelApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save level');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this level?')) return;
    try {
      await levelApi.remove(id);
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
          <h1>📊 Manage Levels</h1>
          <p>Configure level thresholds used for badge progress calculation</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Level</button>
      </div>

      <div className="card mb-2" style={{ padding: '1rem' }}>
        <p className="text-light" style={{ fontSize: '0.85rem' }}>
          <strong>How levels work:</strong> When a user earns XP for a badge, their level is determined by these thresholds.
          A <code>maxPoints</code> of <strong>-1</strong> means unlimited (highest tier).
          Levels are evaluated in <strong>display order</strong>.
        </p>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Name</th>
            <th>Min Points</th>
            <th>Max Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l) => (
            <tr key={l.id}>
              <td>{l.displayOrder}</td>
              <td><strong>{l.name}</strong></td>
              <td>{l.minPoints}</td>
              <td>{l.maxPoints === -1 ? '∞ (unlimited)' : l.maxPoints}</td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(l)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {levels.length === 0 && (
            <tr><td colSpan={5} className="text-center text-light">No levels configured</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <Modal title={editing ? 'Edit Level' : 'New Level'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. DIAMOND" required />
            </div>
            <div className="form-group">
              <label>Min Points (inclusive)</label>
              <input className="form-control" type="number" min={0} value={form.minPoints} onChange={(e) => setForm({ ...form, minPoints: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Max Points (inclusive, -1 for unlimited)</label>
              <input className="form-control" type="number" min={-1} value={form.maxPoints} onChange={(e) => setForm({ ...form, maxPoints: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input className="form-control" type="number" min={0} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} required />
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
