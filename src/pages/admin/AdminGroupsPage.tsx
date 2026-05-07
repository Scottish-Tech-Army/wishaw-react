import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupApi, centreApi, userApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { formatAge } from '../../utils/age';

export default function AdminGroupsPage() {
  const { user, isMainAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [centres, setCentres] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: '', centreId: '' });
  const [memberUserId, setMemberUserId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [gRes, cRes, uRes] = await Promise.all([
        // Centre admin: only fetch their centre's groups
        (!isMainAdmin && user.centreId) ? groupApi.getByCentre(user.centreId) : groupApi.getAll(),
        centreApi.getAll(),
        userApi.getAll(),
      ]);
      setGroups(gRes.data);
      setCentres(cRes.data);
      setUsers(uRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', centreId: isMainAdmin ? (centres[0]?.id || '') : (user.centreId || '') });
    setError('');
    setShowModal(true);
  }

  function openEdit(g) {
    setEditing(g);
    setForm({ name: g.name, centreId: g.centreId || '' });
    setError('');
    setShowModal(true);
  }

  function openMembers(g) {
    setSelectedGroup(g);
    setMemberUserId('');
    setError('');
    setShowMemberModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { name: form.name, centreId: Number(form.centreId) };
    try {
      if (editing) {
        await groupApi.update(editing.id, payload);
      } else {
        await groupApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save group');
    }
  }

  async function handleAddMember() {
    if (!memberUserId) return;
    try {
      const res = await groupApi.addMember(selectedGroup.id, Number(memberUserId));
      setSelectedGroup(res.data);
      setMemberUserId('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  }

  async function handleRemoveMember(userId) {
    try {
      const res = await groupApi.removeMember(selectedGroup.id, userId);
      setSelectedGroup(res.data);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this group?')) return;
    try { await groupApi.remove(id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  }

  // For adding members: centre admin only sees users from their centre
  const availableUsers = (!isMainAdmin && user.centreId)
    ? users.filter((u) => u.role === 'USER' && u.centreId === user.centreId)
    : users.filter((u) => u.role === 'USER');

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-row mb-2">
        <div className="page-header">
          <h1>🎯 Manage Game Groups</h1>
          <p>Create groups and assign players</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Group</button>
      </div>

      {/* Desktop table */}
      <table className="data-table desktop-only">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Centre</th><th>Members</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td><strong>{g.name}</strong></td>
              <td>{g.centreName || '—'}</td>
              <td>{g.members?.length || 0}</td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  <button className="btn btn-outline btn-sm" onClick={() => openMembers(g)}>Members</button>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(g)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {groups.length === 0 && <tr><td colSpan={5} className="text-center text-light">No groups yet</td></tr>}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="mobile-card-list">
        {groups.map((g) => (
          <div className="mobile-card" key={g.id}>
            <div className="mobile-card-row"><span className="mobile-card-label">Name</span><span className="mobile-card-value"><strong>{g.name}</strong></span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Centre</span><span className="mobile-card-value">{g.centreName || '—'}</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Members</span><span className="mobile-card-value">{g.members?.length || 0}</span></div>
            <div className="mobile-card-actions">
              <button className="btn btn-outline btn-sm" onClick={() => openMembers(g)}>Members</button>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(g)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>Delete</button>
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="text-light text-center">No groups yet</p>}
      </div>

      {/* Create/Edit group modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Group' : 'New Group'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Group Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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

      {/* Members modal */}
      {showMemberModal && selectedGroup && (
        <Modal title={`Members — ${selectedGroup.name}`} onClose={() => setShowMemberModal(false)}>
          {error && <div className="error-msg">{error}</div>}
          {selectedGroup.members?.length > 0 ? (
            <div style={{ marginBottom: '1rem' }}>
              {selectedGroup.members.map((m) => (
                <div key={m.userId} className="flex justify-between items-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{m.displayName || m.username} <span className="text-light">({formatAge(m.dob)})</span></span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.userId)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-light mb-2">No members yet</p>
          )}
          <div className="flex gap-1">
            <select className="form-control" value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}>
              <option value="">Select user to add…</option>
              {availableUsers
                .filter((u) => !selectedGroup.members?.some((m) => m.userId === u.id))
                .map((u) => <option key={u.id} value={u.id}>{u.displayName || u.username} ({formatAge(u.dob)}) — {u.centreName}</option>)}
            </select>
            <button className="btn btn-success" onClick={handleAddMember} disabled={!memberUserId}>Add</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
